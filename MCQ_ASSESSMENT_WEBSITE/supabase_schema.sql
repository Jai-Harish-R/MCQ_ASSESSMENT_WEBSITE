-- Enable UUID generation extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (Stores user roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Tests Table (Stores test details without correct answers)
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  teacher_email TEXT NOT NULL,
  title TEXT NOT NULL,
  access_code TEXT NOT NULL,
  questions JSONB NOT NULL, -- Array of questions: [{id: string, text: string, options: string[]}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Test Answers Table (Stores correct options, inaccessible by students)
CREATE TABLE IF NOT EXISTS public.test_answers (
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE PRIMARY KEY,
  correct_answers JSONB NOT NULL, -- Object mapping question ID to correct option index: {"q1": 0, "q2": 2}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Test Attempts Table (Stores student test attempts and scores)
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_email TEXT NOT NULL,
  answers JSONB NOT NULL, -- Object mapping question ID to student's answer index: {"q1": 0, "q2": 1}
  score INT NOT NULL,
  total_questions INT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  allowed_retry BOOLEAN DEFAULT FALSE NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow read access to profiles for authenticated users" 
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update their own profile" 
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Tests Policies
CREATE POLICY "Allow read access to tests for authenticated users" 
  ON public.tests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow teachers to insert their own tests" 
  ON public.tests FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Allow teachers to update their own tests" 
  ON public.tests FOR UPDATE TO authenticated USING (auth.uid() = teacher_id);

CREATE POLICY "Allow teachers to delete their own tests" 
  ON public.tests FOR DELETE TO authenticated USING (auth.uid() = teacher_id);

-- Test Answers Policies (Strict: Only the creator teacher can access)
CREATE POLICY "Allow teachers to select answers for their own tests" 
  ON public.test_answers FOR SELECT TO authenticated 
  USING (auth.uid() = (SELECT teacher_id FROM public.tests WHERE id = test_id));

CREATE POLICY "Allow teachers to insert answers for their own tests" 
  ON public.test_answers FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = (SELECT teacher_id FROM public.tests WHERE id = test_id));

CREATE POLICY "Allow teachers to update answers for their own tests" 
  ON public.test_answers FOR UPDATE TO authenticated 
  USING (auth.uid() = (SELECT teacher_id FROM public.tests WHERE id = test_id));

CREATE POLICY "Allow teachers to delete answers for their own tests" 
  ON public.test_answers FOR DELETE TO authenticated 
  USING (auth.uid() = (SELECT teacher_id FROM public.tests WHERE id = test_id));

-- Test Attempts Policies (Students access their own, Teachers access attempts for their tests)
CREATE POLICY "Allow students and teachers to view attempts" 
  ON public.test_attempts FOR SELECT TO authenticated 
  USING (
    auth.uid() = student_id OR 
    auth.uid() = (SELECT teacher_id FROM public.tests WHERE id = test_id)
  );

CREATE POLICY "Allow students to insert their own attempts" 
  ON public.test_attempts FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Allow teachers and students to update attempts" 
  ON public.test_attempts FOR UPDATE TO authenticated 
  USING (
    auth.uid() = student_id OR 
    auth.uid() = (SELECT teacher_id FROM public.tests WHERE id = test_id)
  );

-- Trigger: Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure RPC Function: Submit Test Attempt & Grade It
CREATE OR REPLACE FUNCTION public.submit_test_attempt(
  p_test_id UUID,
  p_student_id UUID,
  p_student_email TEXT,
  p_answers JSONB
) RETURNS JSONB AS $$
DECLARE
  v_correct_answers JSONB;
  v_score INT := 0;
  v_total INT := 0;
  v_key TEXT;
  v_val JSONB;
  v_correct_val INT;
  v_student_val INT;
  v_attempt_id UUID;
  v_result JSONB;
BEGIN
  -- 1. Fetch correct answers
  SELECT correct_answers INTO v_correct_answers FROM public.test_answers WHERE test_id = p_test_id;
  
  IF v_correct_answers IS NULL THEN
    RAISE EXCEPTION 'Answers not found for this test';
  END IF;

  -- 2. Count total questions and calculate score
  -- answers/correct_answers map question ID string to integer index (e.g. {"q-1": 2, "q-2": 0})
  FOR v_key, v_val IN SELECT * FROM jsonb_each(v_correct_answers) LOOP
    v_total := v_total + 1;
    v_correct_val := v_val::INT;
    
    -- Check if student provided an answer for this question
    IF p_answers ? v_key THEN
      v_student_val := (p_answers->>v_key)::INT;
      IF v_student_val = v_correct_val THEN
        v_score := v_score + 1;
      END IF;
    END IF;
  END LOOP;

  -- 3. Check if attempt already exists
  SELECT id INTO v_attempt_id FROM public.test_attempts 
  WHERE test_id = p_test_id AND student_id = p_student_id;

  IF v_attempt_id IS NOT NULL THEN
    -- Update existing attempt (resets allowed_retry to FALSE)
    UPDATE public.test_attempts SET
      answers = p_answers,
      score = v_score,
      total_questions = v_total,
      completed_at = NOW(),
      allowed_retry = FALSE
    WHERE id = v_attempt_id;
  ELSE
    -- Insert new attempt
    INSERT INTO public.test_attempts (test_id, student_id, student_email, answers, score, total_questions, completed_at, allowed_retry)
    VALUES (p_test_id, p_student_id, p_student_email, p_answers, v_score, v_total, NOW(), FALSE)
    RETURNING id INTO v_attempt_id;
  END IF;

  -- 4. Build response containing score, total, and correct answers key for student's review
  v_result := jsonb_build_object(
    'score', v_score,
    'total_questions', v_total,
    'correct_answers', v_correct_answers
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

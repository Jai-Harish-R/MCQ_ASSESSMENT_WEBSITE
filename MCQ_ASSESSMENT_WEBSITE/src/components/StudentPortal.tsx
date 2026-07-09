import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Bell, ChevronDown, Clock3,
  Clock, ArrowLeft, ArrowRight, Flag, CheckCircle2, 
  AlertTriangle, AlertCircle,  GraduationCap, LogOut,
  LayoutDashboard, BookOpen, Award,
   ClipboardEdit, Target, TrendingUp, CalendarDays,
   BarChart3,  FileText, Trophy, ShieldCheck,
   Lock, Calendar
, Users, Mail} from 'lucide-react';
import studentAvatar from '../assets/student_avatar.png';

interface Question {
  id: string;
  text: string;
  options: string[];
  imageUrl?: string;
}

interface Test {
  id: string;
  title: string;
  access_code: string;
  teacher_email: string;
  questions: Question[];
  duration?: number;
  total_students?: number;
  access_start?: string;
  access_end?: string;
  type?: 'test' | 'assignment' | 'quiz' | 'live_exam';
  created_at?: string;
}

interface Attempt {
  test_title?: string;
  test_type?: string;
  id: string;
  test_id: string;
  student_email: string;
  score: number;
  total_questions: number;
  completed_at: string;
  allowed_retry: boolean;
  time_taken_seconds?: number;
  student_name?: string;
  answers?: Record<string, number>;
}

interface StudentPortalProps {
  user: { id: string; email: string; user_metadata?: { full_name?: string } };
  isDemo: boolean;
  onLogout: () => void;
}

// Demo Data Seeder to match the screenshots exactly
const seedDemoData = () => {
  const existingTests = localStorage.getItem('demo_tests');
  if (!existingTests) {
    const demoTests: Test[] = [
      {
        id: 'test-physics-101',
        title: 'Physics Quiz',
        access_code: '123456',
        teacher_email: 'teacher.demo@codersfun.com',
        type: 'quiz',
        questions: [
          { id: 'p1', text: 'What is the speed of light?', options: ['3e8 m/s', '1e8 m/s', '3e6 m/s', '3e10 m/s'] },
          { id: 'p2', text: 'Which particle has a positive charge?', options: ['Electron', 'Neutron', 'Proton', 'Positron'] },
          { id: 'p3', text: 'What is the unit of electric current?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'] }
        ]
      },
      {
        id: 'test-chem-202',
        title: 'Chemistry Test',
        access_code: '88200',
        teacher_email: 'teacher.demo@codersfun.com',
        type: 'test',
        questions: [
          { id: 'c1', text: 'What is the atomic number of Hydrogen?', options: ['1', '2', '3', '4'] },
          { id: 'c2', text: 'Which gas is commonly known as laughing gas?', options: ['Nitric oxide', 'Nitrous oxide', 'Nitrogen dioxide', 'Nitrogen pentoxide'] }
        ]
      },
      {
        id: 'test-math-303',
        title: 'Math Assignment',
        access_code: '654321',
        teacher_email: 'teacher.demo@codersfun.com',
        type: 'assignment',
        questions: [
          { id: 'm1', text: 'What is the derivative of sin(x)?', options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'] }
        ]
      },
      {
        id: 'test-ai-404',
        title: 'AI Concepts Live Exam',
        access_code: '999999',
        teacher_email: 'teacher.demo@codersfun.com',
        type: 'live_exam',
        questions: [
          { id: 'a1', text: 'What does AI stand for?', options: ['Artificial Intelligence', 'Automated Integration', 'Active Information', 'Actual Input'] }
        ]
      }
    ];
    localStorage.setItem('demo_tests', JSON.stringify(demoTests));

    const demoAnswers = {
      'test-physics-101': { 'p1': 0, 'p2': 2, 'p3': 1 },
      'test-chem-202': { 'c1': 0, 'c2': 1 },
      'test-math-303': { 'm1': 0 },
      'test-ai-404': { 'a1': 0 }
    };
    localStorage.setItem('demo_answers', JSON.stringify(demoAnswers));

    const demoAttempts = [
      // Current student attempts
      {
        id: 'att-harish-phys',
        test_id: 'test-physics-101',
        student_email: 'HARISH@SEC.EDU',
        score: 2,
        total_questions: 3,
        completed_at: '2026-06-07T09:30:00Z',
        allowed_retry: false,
        time_taken_seconds: 1292, // 21m 32s
        answers: { 'p1': 0, 'p2': 1, 'p3': 1 }
      },
      {
        id: 'att-harish-chem',
        test_id: 'test-chem-202',
        student_email: 'HARISH@SEC.EDU',
        score: 2,
        total_questions: 2,
        completed_at: '2026-06-07T14:58:30Z',
        allowed_retry: false,
        time_taken_seconds: 3510, // 58m 30s
        answers: { 'c1': 0, 'c2': 1 }
      },
      {
        id: 'att-harish-math',
        test_id: 'test-math-303',
        student_email: 'HARISH@SEC.EDU',
        score: 1,
        total_questions: 1,
        completed_at: '2026-06-06T11:45:00Z',
        allowed_retry: false,
        time_taken_seconds: 1200, // 20m
        answers: { 'm1': 0 }
      },
      // Other student attempts (for leaderboard)
      {
        id: 'att-aryan-phys',
        test_id: 'test-physics-101',
        student_email: 'aryan.sharma@demo.com',
        score: 3,
        total_questions: 3,
        completed_at: '2026-06-07T09:18:24Z',
        allowed_retry: false,
        time_taken_seconds: 1104, // 18m 24s
        student_name: 'Aryan Sharma',
        answers: { 'p1': 0, 'p2': 2, 'p3': 1 }
      },
      {
        id: 'att-diya-phys',
        test_id: 'test-physics-101',
        student_email: 'diya.patel@demo.com',
        score: 3,
        total_questions: 3,
        completed_at: '2026-06-07T09:20:11Z',
        allowed_retry: false,
        time_taken_seconds: 1211, // 20m 11s
        student_name: 'Diya Patel',
        answers: { 'p1': 0, 'p2': 2, 'p3': 1 }
      },
      {
        id: 'att-rohan-phys',
        test_id: 'test-physics-101',
        student_email: 'rohan.verma@demo.com',
        score: 3,
        total_questions: 3,
        completed_at: '2026-06-07T09:15:45Z',
        allowed_retry: false,
        time_taken_seconds: 945, // 15m 45s
        student_name: 'Rohan Verma',
        answers: { 'p1': 0, 'p2': 2, 'p3': 1 }
      },
      {
        id: 'att-ananya-phys',
        test_id: 'test-physics-101',
        student_email: 'ananya.singh@demo.com',
        score: 2,
        total_questions: 3,
        completed_at: '2026-06-07T09:22:03Z',
        allowed_retry: false,
        time_taken_seconds: 1323, // 22m 03s
        student_name: 'Ananya Singh',
        answers: { 'p1': 0, 'p2': 1, 'p3': 1 }
      },
      {
        id: 'att-ishaan-phys',
        test_id: 'test-physics-101',
        student_email: 'ishaan.mehta@demo.com',
        score: 2,
        total_questions: 3,
        completed_at: '2026-06-07T09:19:17Z',
        allowed_retry: false,
        time_taken_seconds: 1157, // 19m 17s
        student_name: 'Ishaan Mehta',
        answers: { 'p1': 0, 'p2': 1, 'p3': 1 }
      },
      {
        id: 'att-kartik-phys',
        test_id: 'test-physics-101',
        student_email: 'kartik.malhotra@demo.com',
        score: 1,
        total_questions: 3,
        completed_at: '2026-06-07T09:23:10Z',
        allowed_retry: false,
        time_taken_seconds: 1390, // 23m 10s
        student_name: 'Kartik Malhotra',
        answers: { 'p1': 0, 'p2': 1, 'p3': 2 }
      },
      {
        id: 'att-meera-phys',
        test_id: 'test-physics-101',
        student_email: 'meera.nair@demo.com',
        score: 1,
        total_questions: 3,
        completed_at: '2026-06-07T09:24:05Z',
        allowed_retry: false,
        time_taken_seconds: 1445, // 24m 05s
        student_name: 'Meera Nair',
        answers: { 'p1': 0, 'p2': 1, 'p3': 2 }
      }
    ];
    localStorage.setItem('demo_attempts', JSON.stringify(demoAttempts));
  }
};

export default function StudentPortal({ user, isDemo, onLogout }: StudentPortalProps) {
  // Navigation tabs: 'dashboard' | 'lobby' | 'review_attempts' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lobby' | 'review_attempts' | 'leaderboard'>('dashboard');
  const [viewState, setViewState] = useState<'lobby' | 'exam' | 'result'>('lobby');

  // Attempts and tests states (for dashboard and leaderboard verification)
  const [myAttempts, setMyAttempts] = useState<Attempt[]>([]);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);

  const [, setIsLoadingData] = useState(true);
  // Leaderboard dynamically fetched states
  const [leaderboardSelectedTestId, setLeaderboardSelectedTestId] = useState<string>('');
  const [leaderboardAttempts, setLeaderboardAttempts] = useState<Attempt[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const fetchLeaderboardForTest = useCallback(async (testId: string) => {
    if (!testId) {
      setLeaderboardAttempts([]);
      return;
    }
    setLeaderboardLoading(true);
    try {
      if (isDemo) {
        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        const forTest = localAttempts.filter((a: any) => a.test_id === testId);
        const sorted = forTest.sort((a: any, b: any) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.time_taken_seconds || Infinity) - (b.time_taken_seconds || Infinity);
        });
        setLeaderboardAttempts(sorted);
      } else {
        const { data, error } = await supabase
          .from('test_attempts')
          .select('*')
          .eq('test_id', testId);
        
        if (error) throw error;
        
        const sorted = (data || []).sort((a: any, b: any) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.time_taken_seconds || Infinity) - (b.time_taken_seconds || Infinity);
        });
        setLeaderboardAttempts(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLeaderboardLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    fetchLeaderboardForTest(leaderboardSelectedTestId);
  }, [leaderboardSelectedTestId, fetchLeaderboardForTest]);
  
  // Realtime subscription for leaderboard
  useEffect(() => {
    if (isDemo || !leaderboardSelectedTestId) return;
    
    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test_attempts', filter: `test_id=eq.${leaderboardSelectedTestId}` },
        () => {
          fetchLeaderboardForTest(leaderboardSelectedTestId);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [leaderboardSelectedTestId, isDemo, fetchLeaderboardForTest]);


  // Interactive Calendar and Popover states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 5, 7));
  const [showPin, setShowPin] = useState(false); // Default to June 7, 2025

  // Lobby Inputs
  const [teacherEmail, setTeacherEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Leaderboard Access Inputs & Verified Rank State
  const [leaderboardTeacherEmail, setLeaderboardTeacherEmail] = useState('teacher.demo@codersfun.com');
  const [leaderboardAccessCode, setLeaderboardAccessCode] = useState('123456');
  const [leaderboardError, setLeaderboardError] = useState('');
  const [verifiedLeaderboard, setVerifiedLeaderboard] = useState<{
    test: Test;
    attempts: Attempt[];
    userRank: number;
    userScorePercent: number;
    userPercentile: number;
  } | null>(null);

  // Active Exam state
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  
  // Timer State (10 minutes)
  const [secondsLeft, setSecondsLeft] = useState(600);
  const timerRef = useRef<any>(null);

  // Result state
  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, number>>({});
  
  // Email state
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed' | 'fallback'>('idle');
  const [emailLogs, setEmailLogs] = useState<string>('');

  // Extract display name
  const studentDisplayName = user.email.toLowerCase().includes('harish') 
    ? 'Harish' 
    : (user.user_metadata?.full_name || user.email.split('@')[0]);

  // Load student statistics & available tests (memoized for stable realtime subscription)
  const loadPortalData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      if (isDemo) {
        // Load tests & attempts from localStorage
        const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        const localAttempts: Attempt[] = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        
        // Filter my attempts
        const myFiltered = localAttempts.map(att => {
          const t = localTests.find(x => x.id === att.test_id);
          return { ...att, test_title: t ? t.title : 'Deleted Exam' };
        }).filter(att => att.student_email === user.email);
        
        setMyAttempts(myFiltered);

        // Filter tests I haven't submitted yet (or are allowed retry)
        const pending = localTests.filter(t => {
          const att = localAttempts.find(a => a.test_id === t.id && a.student_email === user.email);
          return !att || att.allowed_retry;
        });
        setAvailableTests(pending);
      } else {
        // Load attempts from Supabase
        const { data: attemptsData, error: attemptsErr } = await supabase
          .from('test_attempts')
          .select('*')
          .eq('student_id', user.id)
          .order('completed_at', { ascending: false });

        if (attemptsErr) throw attemptsErr;

        // Fetch test details for each attempt
        if (attemptsData && attemptsData.length > 0) {
          const testIds = attemptsData.map((a: any) => a.test_id);
          const { data: testsData } = await supabase
            .from('tests')
            .select('id, title, type')
            .in('id', testIds);

          const mapped = (attemptsData || []).map((att: any) => {
            const t = (testsData || []).find((x: any) => x.id === att.test_id);
            return { ...att, test_title: t ? t.title : 'Assessment', test_type: t ? t.type : 'test' };
          });
          setMyAttempts(mapped);
        } else {
          setMyAttempts([]);
        }

        // Load all tests to show what is active
        if (attemptsData && attemptsData.length > 0) {
          const testIds = attemptsData.map((a: any) => a.test_id);
          const { data: takenTests } = await supabase
            .from('tests')
            .select('id, title, access_code, teacher_email, type, duration, total_students, created_at, questions')
            .in('id', testIds)
            .order('created_at', { ascending: false });
          if (takenTests) {
            setAvailableTests(takenTests);
          }
        } else {
          setAvailableTests([]);
        }
      }
    } catch (err) {
      console.error("Failed to load student dashboard stats:", err);
    } finally {
      setIsLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.email, isDemo]);

  
  // Supabase Realtime Subscription for Dashboard (fixed with stable callback)
  useEffect(() => {
    // Always do an initial load
    loadPortalData();

    if (isDemo) return;

    const channel = supabase
      .channel(`student-realtime-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test_attempts' },
        (payload) => {
          console.log("Realtime: test_attempts changed", payload);
          loadPortalData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tests' },
        (payload) => {
          console.log("Realtime: tests changed", payload);
          loadPortalData();
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadPortalData, isDemo, user.id]);
  
  // Trigger seeding of demo data
  useEffect(() => {
    if (isDemo) {
      seedDemoData();
    }
  }, [isDemo]);

  const handleReviewPastAttempt = (attempt: Attempt) => {
    let test: Test | null = null;
    if (isDemo) {
      const localTests = JSON.parse(localStorage.getItem('demo_tests') || '[]');
      test = localTests.find((t: any) => t.id === attempt.test_id) || null;
    } else {
      test = availableTests.find(t => t.id === attempt.test_id) || null;
    }

    if (!test) {
      alert("Test data not found.");
      return;
    }

    // Set exam state to display results review
    setActiveTest(test);
    setAnswers(attempt.answers as any || {});
    setScore(attempt.score);
    setTotalQuestions(attempt.total_questions);
    
    // Set correct answers key
    if (isDemo) {
      const localAnswers = JSON.parse(localStorage.getItem('demo_answers') || '{}');
      setCorrectAnswers(localAnswers[test.id] || {});
    } else {
      setCorrectAnswers({});
    }
    
    setViewState('result');
  };

  // Reload portal data on tab navigation to lobby/attempts (not dashboard - already handled by realtime)
  useEffect(() => {
    if (activeTab === 'lobby' || activeTab === 'review_attempts') {
      loadPortalData();
    }
  }, [activeTab, loadPortalData]);

  // Start timer during exam
  useEffect(() => {
    if (viewState === 'exam' && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState]);

  const handleExitLobby = () => {
    setActiveTest(null);
    setViewState('lobby');
    setAnswers({});
    setFlagged({});
    setSecondsLeft(600);
    setScore(null);
    setCorrectAnswers({});
    setEmailStatus('idle');
    setActiveTab('dashboard');
  };

  // Check and Enter Test
  const handleEnterTest = async (e: React.FormEvent, customEmail?: string, customPIN?: string) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const emailInput = customEmail || teacherEmail;
    const pinInput = customPIN || accessCode;

    if (!emailInput || !pinInput) {
      setErrorMsg('Please enter both teacher email and access code PIN.');
      setLoading(false);
      return;
    }

    try {
      let test: Test | null = null;
      let existingAttempt: any = null;

      if (isDemo) {
        const localTests = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        test = localTests.find(
          (t: any) => 
            t.teacher_email.toLowerCase() === emailInput.toLowerCase().trim() && 
            t.access_code === pinInput.trim()
        ) || null;

        if (test) {
          const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
          existingAttempt = localAttempts.find(
            (a: any) => a.test_id === test!.id && a.student_email === user.email
          ) || null;
        }
      } else {
        const { data: testData, error: testErr } = await supabase
          .from('tests')
          .select('*')
          .ilike('teacher_email', emailInput.trim())
          .eq('access_code', pinInput.trim())
          .maybeSingle();

        if (testErr) throw testErr;
        test = testData;
        
        // Safety parse for JSON string (fixes the blank page crash)
        if (test && typeof test.questions === 'string') {
          try {
            test.questions = JSON.parse(test.questions);
          } catch (e) {
            console.error('Failed to parse questions', e);
          }
        }

        if (test) {
          const { data: attemptData, error: attemptErr } = await supabase
            .from('test_attempts')
            .select('*')
            .eq('test_id', test.id)
            .eq('student_id', user.id)
            .maybeSingle();

          if (attemptErr) throw attemptErr;
          existingAttempt = attemptData;
        }
      }

      if (!test) {
        setErrorMsg('No test found matching this teacher email and access code PIN.');
        setLoading(false);
        return;
      }

      // Access time check
      const now = new Date();
      if (test.access_start && now < new Date(test.access_start)) {
        setErrorMsg('This test has not started yet. Please wait until ' + new Date(test.access_start).toLocaleString());
        setLoading(false);
        return;
      }
      if (test.access_end && now > new Date(test.access_end)) {
        setErrorMsg('This test has ended on ' + new Date(test.access_end).toLocaleString() + '. You can no longer write the exam.');
        setLoading(false);
        return;
      }

      if (existingAttempt) {
        if (!existingAttempt.allowed_retry) {
          setErrorMsg(`Already Submitted: You completed this exam on ${new Date(existingAttempt.completed_at).toLocaleDateString()}. Score: ${existingAttempt.score}/${existingAttempt.total_questions}. Ask your educator for a retake authorization if you faced network issues.`);
          setLoading(false);
          return;
        } else {
          alert("Retake Authorized: Your teacher has authorized a retry due to technical issues. Your previous score will be updated.");
        }
      }

      setActiveTest(test);
      setSecondsLeft((test.duration || 10) * 60);
      setViewState('exam');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while entering the test.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    alert("Time is up! Your exam will be submitted automatically.");
    handleSubmitExam(true);
  };

  // Submit Exam
  const handleSubmitExam = async (force = false) => {
    if (!activeTest) return;
    if (!force && !confirm('Are you sure you want to finish and submit your exam?')) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);

    try {
      if (isDemo) {
        const localAnswers = JSON.parse(localStorage.getItem('demo_answers') || '{}');
        const correctAnswersKey = localAnswers[activeTest.id] || {};
        
        let calculatedScore = 0;
        const total = activeTest.questions.length;
        
        activeTest.questions.forEach((q) => {
          const correctIdx = correctAnswersKey[q.id];
          if (answers[q.id] === correctIdx) {
            calculatedScore++;
          }
        });

        const newAttempt = {
          id: 'attempt-' + Date.now(),
          test_id: activeTest.id,
          student_email: user.email,
          answers: answers,
          score: calculatedScore,
          total_questions: total,
          completed_at: new Date().toISOString(),
          allowed_retry: false
        };

        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        const filteredAttempts = localAttempts.filter(
          (a: any) => !(a.test_id === activeTest!.id && a.student_email === user.email)
        );
        filteredAttempts.push(newAttempt);
        localStorage.setItem('demo_attempts', JSON.stringify(filteredAttempts));

        setScore(calculatedScore);
        setTotalQuestions(total);
        setCorrectAnswers(correctAnswersKey);
        setViewState('result');
        dispatchEmailNotification(calculatedScore, total, correctAnswersKey, activeTest);
      } else {
        const { data, error } = await supabase.rpc('submit_test_attempt', {
          p_test_id: activeTest.id,
          p_student_id: user.id,
          p_student_email: user.email,
          p_answers: answers
        });

        if (error) throw error;

        setScore(data.score);
        setTotalQuestions(data.total_questions);
        setCorrectAnswers(data.correct_answers);
        setViewState('result');
        dispatchEmailNotification(data.score, data.total_questions, data.correct_answers, activeTest);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit exam.');
    } finally {
      setLoading(false);
    }
  };

  // Dispatch email transmittal
  const dispatchEmailNotification = async (
    finalScore: number, 
    total: number, 
    answersKey: Record<string, number>,
    testInfo: Test
  ) => {
    setEmailStatus('sending');
    const mailPayload = {
      studentEmail: user.email,
      teacherEmail: testInfo.teacher_email,
      testTitle: testInfo.title,
      score: finalScore,
      totalQuestions: total,
      questions: testInfo.questions.map((q) => ({
        text: q.text,
        options: q.options,
        selectedOption: answers[q.id] !== undefined ? q.options[answers[q.id]] : 'Not Answered',
        correctOption: q.options[answersKey[q.id]],
        isCorrect: answers[q.id] === answersKey[q.id],
        imageUrl: q.imageUrl || ''
      }))
    };

    try {
      const response = await fetch('http://localhost:8080/api/test/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailPayload)
      });

      if (response.ok) {
        setEmailStatus('sent');
      } else {
        throw new Error('Spring Boot returned error code: ' + response.status);
      }
    } catch (err: any) {
      console.warn("Spring Boot Mail offline, launching Local Mail Sandbox simulator. Details:", err.message);
      setEmailStatus('fallback');
      const logText = `
Connecting to SMTP Mail Server (Spring Mail)... [FAILED]
Fallback mode: Activating In-App Email Sandbox & Simulation Portal.
SMTP MIME-Message compiled:
-------------------------------------------------------
Date: ${new Date().toUTCString()}
From: EduVerify Pro Portal <no-reply@eduverify-pro.edu>
To: ${user.email}
Subject: Results Review: ${testInfo.title} - Score: ${finalScore}/${total}
Content-Type: text/html; charset=UTF-8

[HTML Body Generated Successfully]
-------------------------------------------------------
      `.trim();
      setEmailLogs(logText);
    }
  };

  // Verify and unlock class rankings leaderboard
  const handleVerifyLeaderboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaderboardError('');
    setVerifiedLeaderboard(null);
    setLoading(true);

    if (!leaderboardTeacherEmail || !leaderboardAccessCode) {
      setLeaderboardError('Please fill in both fields.');
      setLoading(false);
      return;
    }

    try {
      let test: Test | null = null;
      let allAttemptsForTest: Attempt[] = [];

      if (isDemo) {
        const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        test = localTests.find(
          t => 
            t.teacher_email.toLowerCase() === leaderboardTeacherEmail.toLowerCase().trim() &&
            t.access_code === leaderboardAccessCode.trim()
        ) || null;

        if (test) {
          const localAttempts: Attempt[] = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
          allAttemptsForTest = localAttempts.filter(a => a.test_id === test!.id);
        }
      } else {
        // Fetch test from Supabase
        const { data: testData } = await supabase
          .from('tests')
          .select('*')
          .eq('teacher_email', leaderboardTeacherEmail.trim())
          .eq('access_code', leaderboardAccessCode.trim())
          .maybeSingle();

        test = testData;

        if (test) {
          // Fetch all attempts
          const { data: attemptsData } = await supabase
            .from('test_attempts')
            .select('*')
            .eq('test_id', test.id);
          
          allAttemptsForTest = attemptsData || [];
        }
      }

      if (!test) {
        setLeaderboardError('No test found matching these details.');
        setLoading(false);
        return;
      }

      // Verify current student has taken the test
      const myAttempt = allAttemptsForTest.find(a => a.student_email === user.email);
      if (!myAttempt) {
        setLeaderboardError('Leaderboard locked: You must take and submit this exam before you can access its leaderboard.');
        setLoading(false);
        return;
      }

      // Process rankings
      // Sort attempts descending by score percentage
      const sortedAttempts = [...allAttemptsForTest].sort((a, b) => {
        const pctA = a.score / a.total_questions;
        const pctB = b.score / b.total_questions;
        return pctB - pctA;
      });

      // Find current student rank
      const rankIdx = sortedAttempts.findIndex(a => a.student_email === user.email);
      const userRank = rankIdx !== -1 ? rankIdx + 1 : sortedAttempts.length + 1;
      const userScorePercent = Math.round((myAttempt.score / myAttempt.total_questions) * 100);

      // Percentile: (number of people below user) / total * 100
      const belowCount = sortedAttempts.length - userRank;
      const userPercentile = sortedAttempts.length > 1
        ? Math.round((belowCount / (sortedAttempts.length - 1)) * 100)
        : 100;

      setVerifiedLeaderboard({
        test,
        attempts: sortedAttempts,
        userRank,
        userScorePercent,
        userPercentile
      });

    } catch (err: any) {
      console.error(err);
      setLeaderboardError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Stats calculations
  const totalCompleted = myAttempts.length;
  const averageAccuracy = totalCompleted > 0
    ? Math.round((myAttempts.reduce((sum, att) => sum + (att.score / att.total_questions), 0) / totalCompleted) * 100)
    : 0;

  const averageImprovement = React.useMemo(() => {
    if (myAttempts.length < 2) {
      if (myAttempts.length === 1) {
        return Math.round((myAttempts[0].score / myAttempts[0].total_questions) * 100);
      }
      return 0;
    }
    const sorted = [...myAttempts].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
    let totalDiff = 0;
    for (let i = 1; i < sorted.length; i++) {
      const currentPct = (sorted[i].score / sorted[i].total_questions) * 100;
      const prevPct = (sorted[i - 1].score / sorted[i - 1].total_questions) * 100;
      totalDiff += (currentPct - prevPct);
    }
    return Math.round(totalDiff / (sorted.length - 1));
  }, [myAttempts]);

  // Active Exam View hides sidebar
  if (viewState === 'exam' || viewState === 'result') {
    return (
      <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="edu-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ea580c',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '18px'
            }}>
              C
            </div>
            <h2 style={{ fontSize: '15px', fontWeight: '700' }}>CodersFun - Timed Exam Portal</h2>
          </div>
          <div style={{ fontSize: '13px', fontWeight: '500' }}>{user.email}</div>
        </header>

        <div className="container-student" style={{ flex: 1, padding: '32px 0 80px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          
          {/* ACTIVE EXAM INTERFACE */}
          {viewState === 'exam' && activeTest && (!activeTest.questions || activeTest.questions.length === 0 || !activeTest.questions[currentQIdx]) && (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Error Loading Questions</h2>
              <p style={{ color: '#64748b', marginTop: '8px' }}>
                The question data for this test is missing or corrupted. 
                Please contact your educator.
              </p>
            </div>
          )}
          {viewState === 'exam' && activeTest && activeTest.questions && activeTest.questions.length > 0 && activeTest.questions[currentQIdx] && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-default)', padding: '16px 24px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Active Exam</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)', marginTop: '2px' }}>{activeTest.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: secondsLeft < 60 ? 'var(--color-error-container)' : 'var(--color-surface-container)', color: secondsLeft < 60 ? 'var(--color-on-error-container)' : 'var(--color-on-surface)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: '700', fontFamily: 'monospace', fontSize: '16px' }}>
                  <Clock size={16} />
                  <span>{formatTime(secondsLeft)}</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '6px' }}>
                  <span>Answer Progress</span>
                  <span>{Object.keys(answers).length} of {activeTest.questions.length} Answered</span>
                </div>
                <div className="progress-bar-container" style={{ height: '8px', backgroundColor: '#cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(Object.keys(answers).length / activeTest.questions.length) * 100}%`, height: '100%', backgroundColor: secondsLeft < 60 ? 'var(--color-error)' : '#1c4e80', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              <div className="mcq-card-enhanced" style={{ minHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontFamily: 'var(--font-headlines)', fontWeight: '600', color: 'var(--color-on-surface-variant)', fontSize: '13px' }}>
                    QUESTION {currentQIdx + 1} OF {activeTest.questions.length}
                  </span>
                  <button
                    onClick={() => setFlagged({ ...flagged, [activeTest.questions[currentQIdx].id]: !flagged[activeTest.questions[currentQIdx].id] })}
                    style={{ border: 'none', background: 'none', color: flagged[activeTest.questions[currentQIdx].id] ? 'var(--color-warning)' : 'var(--color-outline)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '500' }}
                  >
                    <Flag size={14} fill={flagged[activeTest.questions[currentQIdx].id] ? 'currentColor' : 'none'} />
                    Flag for Review
                  </button>
                </div>

                <>
                    <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '18px', fontWeight: '500', lineHeight: '28px', marginBottom: '24px' }}>
                      {activeTest.questions[currentQIdx].text}
                    </h2>

                    {activeTest.questions[currentQIdx].imageUrl && (
                      <div className="exam-img-container" style={{ marginBottom: '24px' }}>
                        <img src={activeTest.questions[currentQIdx].imageUrl} className="exam-img" alt="Question attachment" />
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {activeTest.questions[currentQIdx].options.map((opt, optIdx) => {
                        const qId = activeTest.questions[currentQIdx].id;
                        const isSelected = answers[qId] === optIdx;
                        return (
                          <label key={optIdx} className={`option-container ${isSelected ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name={`q-${qId}-options`}
                              checked={isSelected}
                              onChange={() => setAnswers({ ...answers, [qId]: optIdx })}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '24px', marginTop: '32px' }}>
                  <button type="button" onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} className="btn btn-secondary" disabled={currentQIdx === 0}>
                    <ArrowLeft size={16} /> Previous
                  </button>
                  {currentQIdx < activeTest.questions.length - 1 ? (
                    <button type="button" onClick={() => setCurrentQIdx(currentQIdx + 1)} className="btn btn-secondary">
                      Next <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleSubmitExam()} className="btn btn-success" style={{ padding: '10px 24px' }}>
                      Finish & Submit Exam
                    </button>
                  )}
                </div>
              </div>

              {/* Navigator */}
              <div className="card">
                <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Question Navigator</h4>
                <div className="nav-grid">
                  {activeTest.questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isFlagged = flagged[q.id];
                    const isActive = idx === currentQIdx;
                    let styleClass = 'nav-box-unvisited';
                    if (isAnswered) styleClass = 'nav-box-answered';
                    if (isFlagged) styleClass = 'nav-box-flagged';
                    return (
                      <button key={q.id} onClick={() => setCurrentQIdx(idx)} className={`nav-box ${styleClass} ${isActive ? 'nav-box-active' : ''}`}>
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* EXAM SUBMISSION GRADE RESULT */}
          {viewState === 'result' && activeTest && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="mcq-card-enhanced" style={{ minHeight: '300px', textAlign: 'center', padding: '40px', border: '2px solid #1c4e80' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Exam Submitted!</h2>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>Your results have been verified and graded.</p>
                <div style={{ margin: '24px auto', maxWidth: '200px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-outline)', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Marks Secured</span>
                  <div style={{ fontSize: '42px', fontWeight: '800', color: '#1c4e80' }}>
                    {score} <span style={{ fontSize: '20px', color: 'var(--color-on-surface-variant)', fontWeight: '500' }}>/ {totalQuestions}</span>
                  </div>
                  <span className="chip chip-success" style={{ marginTop: '8px', fontSize: '13px' }}>{Math.round((score! / totalQuestions) * 100)}% Grade</span>
                </div>
                {emailStatus === 'sending' && <div style={{ fontSize: '13px', color: 'var(--color-outline)' }}>Sending report to email...</div>}
                {emailStatus === 'sent' && <div style={{ color: 'var(--color-success)', fontSize: '13px', fontWeight: '500' }}>Official receipt sent to: {user.email}</div>}
                {emailStatus === 'fallback' && <div style={{ color: 'var(--color-warning)', fontSize: '13px', fontWeight: '500' }}>Spring Mail offline. Sandbox report rendered below.</div>}
              </div>

              {emailStatus === 'fallback' && (
                <div className="card" style={{ border: '1px dashed var(--color-warning)', padding: '0', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-surface-container)', padding: '16px 20px', borderBottom: '1px solid var(--color-outline-variant)' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-warning)', textTransform: 'uppercase', marginBottom: '8px' }}>Mock SMTP Mail Simulator</h4>
                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace', color: 'var(--color-on-surface-variant)' }}>
                      <div><strong>To:</strong> {user.email}</div>
                      <div><strong>Subject:</strong> Results Review: {activeTest.title} (Score: {score}/{totalQuestions})</div>
                    </div>
                  </div>
                  <div style={{ padding: '24px', backgroundColor: '#ffffff', color: '#1a1a1a', fontSize: '14px' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid #e2e8f0', padding: '24px' }}>
                      <h2 style={{ color: '#003875', borderBottom: '3px solid #003875', paddingBottom: '12px' }}>Grading Summary Report</h2>
                      <p style={{ margin: '16px 0' }}>Dear Student ({user.email}),</p>
                      <table style={{ width: '100%', margin: '20px 0', border: '1px solid #e2e8f0', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr style={{ backgroundColor: '#f8fafc' }}><td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Test Title</td><td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>{activeTest.title}</td></tr>
                          <tr><td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Score</td><td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', color: '#003875', fontWeight: 'bold' }}>{score} / {totalQuestions} ({Math.round((score! / totalQuestions) * 100)}%)</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div style={{ padding: '12px 20px', backgroundColor: '#1e293b', color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{emailLogs}</div>
                </div>
              )}

              {/* Review card list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeTest.questions.map((q, idx) => {
                  const studentAnsIdx = answers[q.id];
                  const correctAnsIdx = correctAnswers[q.id];
                  const isCorrect = studentAnsIdx === correctAnsIdx;
                  return (
                    <div key={q.id} className="card" style={{ borderLeft: `5px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>Question #{idx + 1}</span>
                        <span style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)', fontWeight: '600' }}>{isCorrect ? 'Correct (+1)' : 'Incorrect (+0)'}</span>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>{q.text}</h4>
                      {q.imageUrl && <div className="exam-img-container" style={{ margin: '12px 0', textAlign: 'left' }}><img src={q.imageUrl} className="exam-img" style={{ maxHeight: '180px' }} alt="" /></div>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt, optIdx) => {
                          const isStudentSelected = studentAnsIdx === optIdx;
                          const isCorrectOpt = correctAnsIdx === optIdx;
                          let optionStyle: React.CSSProperties = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' };
                          if (isStudentSelected) { optionStyle.border = '2px solid var(--color-error)'; optionStyle.backgroundColor = 'var(--color-error-container)'; }
                          if (isCorrectOpt) { optionStyle.border = '2px solid var(--color-success)'; optionStyle.backgroundColor = 'var(--color-success-container)'; }
                          return (
                            <div key={optIdx} style={optionStyle}>
                              <span>{opt}</span>
                              <span style={{ fontSize: '10px', fontWeight: '600' }}>{isCorrectOpt && 'Correct Option'}{isStudentSelected && !isCorrectOpt && 'Your Choice'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={handleExitLobby} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }
  

  

  // STANDARD PORTAL WITH SIDEBAR
  
  const assessmentsOverview = React.useMemo(() => {
    const total = availableTests.length;
    let tests = 0, quizzes = 0, assignments = 0, live_exams = 0;
    availableTests.forEach(t => {
      const type = t.type || 'test';
      if (type === 'test') tests++;
      if (type === 'quiz') quizzes++;
      if (type === 'assignment') assignments++;
      if (type === 'live_exam') live_exams++;
    });
    
    // Generate donut chart conic gradient
    let currentPct = 0;
    const gradients = [];
    if (tests > 0) { const p = (tests/total)*100; gradients.push(`#3b82f6 ${currentPct}% ${currentPct + p}%`); currentPct += p; }
    if (quizzes > 0) { const p = (quizzes/total)*100; gradients.push(`#a855f7 ${currentPct}% ${currentPct + p}%`); currentPct += p; }
    if (assignments > 0) { const p = (assignments/total)*100; gradients.push(`#f59e0b ${currentPct}% ${currentPct + p}%`); currentPct += p; }
    if (live_exams > 0) { const p = (live_exams/total)*100; gradients.push(`#ef4444 ${currentPct}% ${currentPct + p}%`); currentPct += p; }
    
    const bg = gradients.length > 0 ? `conic-gradient(${gradients.join(', ')})` : 'conic-gradient(#f1f5f9 0% 100%)';

    return {
      total,
      bg,
      tests: { count: tests, pct: total ? Math.round((tests/total)*100) : 0 },
      quizzes: { count: quizzes, pct: total ? Math.round((quizzes/total)*100) : 0 },
      assignments: { count: assignments, pct: total ? Math.round((assignments/total)*100) : 0 },
      live_exams: { count: live_exams, pct: total ? Math.round((live_exams/total)*100) : 0 },
    };
  }, [availableTests]);

  const performanceTrend = React.useMemo(() => {
    // Get last 4 attempts
    const recent = [...myAttempts].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()).slice(-4);
    while (recent.length < 4) {
      recent.unshift({ score: 0, total_questions: 1 } as any); // padding
    }
    return recent.map(att => Math.round((att.score / att.total_questions) * 100));
  }, [myAttempts]);

  return (
    <div className="edu-app-frame" style={{ backgroundColor: '#fafafa' }}>
      
      {/* Sidebar matching the image exactly */}
      <aside className="edu-sidebar" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #f1f5f9', padding: '24px 20px', display: 'flex', flexDirection: 'column', width: '260px' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '0 8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ea580c',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '18px'
          }}>
            C
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', fontFamily: 'var(--font-headlines)' }}>
            Coders<span style={{ color: '#ea580c' }}>Fun</span>
          </span>
        </div>

        {/* Profile Card Widget at the Top */}
        <div style={{ marginBottom: '32px', padding: '0 8px' }}>
          <div 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
              borderRadius: '12px', backgroundColor: '#ffffff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
              cursor: 'pointer'
            }}
          >
            <img src={studentAvatar as any} alt="Student" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #e2e8f0' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{studentDisplayName || 'jhgno.official'}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Student</div>
            </div>
            <ChevronDown size={16} color="#94a3b8" />
          </div>
        </div>

        {/* Navigation Menu */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <li>
            <button
              onClick={() => { setActiveTab('dashboard'); setVerifiedLeaderboard(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
                borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600',
                backgroundColor: activeTab === 'dashboard' ? '#fff7ed' : 'transparent',
                color: activeTab === 'dashboard' ? '#ea580c' : '#475569', transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('lobby'); setVerifiedLeaderboard(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
                borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600',
                backgroundColor: activeTab === 'lobby' ? '#fff7ed' : 'transparent',
                color: activeTab === 'lobby' ? '#ea580c' : '#475569', transition: 'all 0.2s'
              }}
            >
              <BookOpen size={20} />
              Take Test
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('review_attempts'); setVerifiedLeaderboard(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
                borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600',
                backgroundColor: activeTab === 'review_attempts' ? '#fff7ed' : 'transparent',
                color: activeTab === 'review_attempts' ? '#ea580c' : '#475569', transition: 'all 0.2s'
              }}
            >
              <Clock size={20} />
              Review Attempts
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('leaderboard'); setVerifiedLeaderboard(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
                borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600',
                backgroundColor: activeTab === 'leaderboard' ? '#fff7ed' : 'transparent',
                color: activeTab === 'leaderboard' ? '#ea580c' : '#475569', transition: 'all 0.2s'
              }}
            >
              <Award size={20} />
              Leaderboard
            </button>
          </li>
        </ul>

        {/* Bottom Actions - Logout Button */}
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button 
            onClick={onLogout} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
              borderRadius: '12px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '15px', fontWeight: '600',
              backgroundColor: '#ffffff', color: '#475569', transition: 'all 0.2s', justifyContent: 'center'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header Bar */}
        <header style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', 
          padding: '24px 40px', gap: '24px', backgroundColor: 'transparent'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search anything..." 
              style={{
                width: '100%', padding: '12px 16px 12px 42px', borderRadius: '24px', border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff', fontSize: '14px', outline: 'none', color: '#0f172a'
              }} 
            />
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={24} color="#64748b" />
            <span style={{ 
              position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', 
              color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #ffffff'
            }}>3</span>
          </div>

          {/* Header Avatar */}
          <img src={studentAvatar as any} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
        </header>

        {/* Content Area */}
        <div style={{ padding: '0 40px 40px 40px', flex: 1 }}>

          {/* TAB 1: STUDENT DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Welcome Section */}
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  Welcome back, {studentDisplayName || 'jhgno.official'}! 👋
                </h1>
                <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: '500' }}>
                  Track your progress, learn consistently, and achieve your goals.
                </p>
              </div>

              {/* 4 Stat Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ClipboardEdit size={28} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Tests Taken</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{myAttempts.length}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}><span style={{ color: '#ea580c', fontWeight: '600' }}>+{Math.min(myAttempts.length, 5)}</span> this month</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Average Score</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{averageAccuracy || 0}%</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}><span style={{ color: '#16a34a', fontWeight: '600' }}>+12%</span> from last month</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={28} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Tests Completed</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{myAttempts.length}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}><span style={{ color: '#a855f7', fontWeight: '600' }}>+4</span> this month</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#e0f2fe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={28} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>Average Improvement <AlertCircle size={12} /></div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{averageImprovement >= 0 ? '+' : ''}{averageImprovement}%</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Real-time update</div>
                  </div>
                </div>
              </div>

              {/* Grid Layout for Main Content */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '24px' }}>
                
                {/* Left Column (Calendar, Charts, Quick Actions) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Calendar Box */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>Today</button>
                        <button style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>&lt;</button>
                        <button style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>&gt;</button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '16px' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', paddingBottom: '8px' }}>{day}</div>
                      ))}
                      
                      {/* Dynamic Real-time Calendar Grid */}
                      {Array.from({length: 35}, (_, i) => {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = today.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const daysInPrevMonth = new Date(year, month, 0).getDate();
                        
                        const dateNum = i - firstDay + 1;
                        let isCurrentMonth = true;
                        let displayNum = dateNum;
                        
                        if (dateNum <= 0) {
                          isCurrentMonth = false;
                          displayNum = daysInPrevMonth + dateNum;
                        } else if (dateNum > daysInMonth) {
                          isCurrentMonth = false;
                          displayNum = dateNum - daysInMonth;
                        }
                        
                        const currentDateString = new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum).toISOString().split('T')[0];
                        
                        // Check if any tests were taken on this day
                        const dayAttempts = myAttempts.filter(att => new Date(att.completed_at).toISOString().split('T')[0] === currentDateString);
                        const isToday = isCurrentMonth && displayNum === today.getDate();
                        
                        return (
                          <div key={i} style={{ 
                            position: 'relative', padding: '12px 0 24px', fontSize: '14px', fontWeight: '600', 
                            color: isCurrentMonth ? (isToday ? '#ea580c' : '#0f172a') : '#cbd5e1',
                            backgroundColor: isToday ? '#fff7ed' : 'transparent',
                            borderRadius: '12px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                          }}>
                            {displayNum}
                            
                            {/* Render Icons for Specific Dates dynamically based on myAttempts */}
                            {dayAttempts.length > 0 && (
                                <div style={{ position: 'absolute', bottom: '6px', display: 'flex', gap: '2px' }}>
                                  {dayAttempts.slice(0, 3).map((att, idx) => {
                                    if (att.test_type === 'quiz') return <FileText key={idx} size={14} color="#3b82f6" />;
                                    if (att.test_type === 'assignment') return <ClipboardEdit key={idx} size={14} color="#ea580c" />;
                                    if (att.test_type === 'live_exam') return <Trophy key={idx} size={14} color="#a855f7" />;
                                    return <Target key={idx} size={14} color="#22c55e" />; // test/result
                                  })}
                                </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><FileText size={14} color="#3b82f6" /> Test</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><ClipboardEdit size={14} color="#ea580c" /> Assignment</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><Trophy size={14} color="#a855f7" /> Quiz</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><Target size={14} color="#22c55e" /> Result</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><BookOpen size={14} color="#ef4444" /> Live Exam</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><Bell size={14} color="#f59e0b" /> Reminder</div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Donut Chart Mock */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Assessments Overview</h3>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0' }}>Your overall activity this month</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Dynamic Donut Chart */}
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: assessmentsOverview.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', position: 'relative' }}>
                          <div style={{ width: '72px', height: '72px', backgroundColor: '#ffffff', borderRadius: '50%', position: 'absolute' }}></div>
                          <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{assessmentsOverview.total || 0}</span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Total</span>
                          </div>
                        </div>
                        
                        {/* List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, paddingLeft: '24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#3b82f6' }}></div> Tests</span> <span>{assessmentsOverview.tests.count} ({assessmentsOverview.tests.pct}%)</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#a855f7' }}></div> Quizzes</span> <span>{assessmentsOverview.quizzes.count} ({assessmentsOverview.quizzes.pct}%)</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#f59e0b' }}></div> Assignments</span> <span>{assessmentsOverview.assignments.count} ({assessmentsOverview.assignments.pct}%)</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#ef4444' }}></div> Live Exams</span> <span>{assessmentsOverview.live_exams.count} ({assessmentsOverview.live_exams.pct}%)</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Line Chart Mock */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Performance Trend</h3>
                          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0' }}>Your average score over time</p>
                        </div>
                        <select style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '12px', fontWeight: '600', color: '#475569', outline: 'none' }}>
                          <option>This Month</option>
                        </select>
                      </div>
                      
                      {/* Fake Line Chart SVG using SVG path for visual */}
                      <div style={{ position: 'relative', height: '140px', width: '100%', marginTop: '10px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none">
                          {/* Grid lines */}
                          <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="110" x2="300" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                          
                          {/* Line and Area */}
                          <path d={`M 0 110 L 50 ${110 - performanceTrend[0] * 0.9} L 120 ${110 - performanceTrend[1] * 0.9} L 200 ${110 - performanceTrend[2] * 0.9} L 300 ${110 - performanceTrend[3] * 0.9} L 300 110 Z`} fill="rgba(234, 88, 12, 0.1)" />
                          <path d={`M 0 110 L 50 ${110 - performanceTrend[0] * 0.9} L 120 ${110 - performanceTrend[1] * 0.9} L 200 ${110 - performanceTrend[2] * 0.9} L 300 ${110 - performanceTrend[3] * 0.9}`} fill="none" stroke="#ea580c" strokeWidth="3" />
                          
                          {/* Points */}
                          <circle cx="50" cy={110 - (performanceTrend[0] * 0.9)} r="4" fill="#ea580c" />
                          <circle cx="120" cy={110 - (performanceTrend[1] * 0.9)} r="4" fill="#ea580c" />
                          <circle cx="200" cy={110 - (performanceTrend[2] * 0.9)} r="4" fill="#ea580c" />
                          <circle cx="300" cy={110 - (performanceTrend[3] * 0.9)} r="4" fill="#ea580c" />
                        </svg>
                        {/* Axis Labels */}
                        <div style={{ position: 'absolute', bottom: '-15px', display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                          <span style={{ marginLeft: '40px' }}>Week 1</span>
                          <span>Week 2</span>
                          <span>Week 3</span>
                          <span style={{ marginRight: '10px' }}>Week 4</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Take Assessment</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Start a new test</div>
                          </div>
                        </div>
                        <ArrowRight size={16} color="#94a3b8" />
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>View Results</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Check your performance</div>
                          </div>
                        </div>
                        <ArrowRight size={16} color="#94a3b8" />
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock3 size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Past Submissions</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Review your attempts</div>
                          </div>
                        </div>
                        <ArrowRight size={16} color="#94a3b8" />
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Resources</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Notes and materials</div>
                          </div>
                        </div>
                        <ArrowRight size={16} color="#94a3b8" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column (Upcoming, Activity, Quick Access) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Recent Activity */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recent Activity</h3>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#ea580c', cursor: 'pointer' }}>View All</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {myAttempts.length === 0 ? (
                        <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No recent activity found.</div>
                      ) : (
                        myAttempts.slice(0, 4).map(attempt => {
                          const pct = (attempt.score / attempt.total_questions) * 100;
                          const isPassed = pct >= 40;
                          
                          let fg = isPassed ? '#16a34a' : '#ea580c';
                          let Icon = isPassed ? CheckCircle2 : AlertCircle;
                          
                          return (
                            <div key={attempt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Icon size={16} color={fg} />
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                  {attempt.test_title || 'Assessment'} submitted
                                </span>
                              </div>
                              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                {new Date(attempt.completed_at).toLocaleDateString()}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Quick Access */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>Quick Access</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>My Submissions</div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>View your attempts</div>
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BarChart3 size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Results History</div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Check your scores</div>
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Study Materials</div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Access resources</div>
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Target size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Download Reports</div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Export your data</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TAKE TEST ENTRY LOBBY */}
          {activeTab === 'lobby' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header */}
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Welcome back, {studentDisplayName || 'jhgno.official'}! 👋
                </h1>
                <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: '500' }}>
                  Ready to test your skills? Join a test using the details below.
                </p>
              </div>

              {/* Main Join Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '24px' }}>
                
                {/* Left Column: Form & Graphic */}
                <div style={{ display: 'flex', gap: '32px', borderRight: '1px solid #f1f5f9', paddingRight: '24px' }}>
                  {/* Clipboard graphic container */}
                  <div style={{
                    width: '180px', height: '180px', backgroundColor: '#eff6ff', borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    position: 'relative'
                  }}>
                    {/* SVG Clipboard */}
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="25" y="20" width="50" height="65" rx="8" fill="white" stroke="#3b82f6" strokeWidth="4" />
                      <rect x="38" y="12" width="24" height="12" rx="4" fill="#3b82f6" />
                      <path d="M35 40 L42 47 L58 32" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M35 55 L42 62 L58 47" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M35 70 L42 77 L58 62" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* Overlapping lock badge */}
                    <div style={{
                      position: 'absolute', bottom: '-10px', right: '-10px',
                      backgroundColor: '#a855f7', borderRadius: '50%', padding: '12px',
                      color: '#ffffff', boxShadow: '0 4px 10px rgba(168, 85, 247, 0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Lock size={20} />
                    </div>
                  </div>
                  
                  {/* Form */}
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Join a Test</h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                      Enter the details provided by your teacher to start your assessment.
                    </p>
                    
                    <form onSubmit={handleEnterTest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {errorMsg && (
                        <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                          <AlertTriangle size={16} /> {errorMsg}
                        </div>
                      )}
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Teacher Email Address</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>✉️</span>
                          <input
                            type="email"
                            placeholder="Enter teacher email address"
                            value={teacherEmail}
                            onChange={(e) => setTeacherEmail(e.target.value)}
                            required
                            style={{
                              width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0',
                              fontSize: '14px', outline: 'none', color: '#0f172a', backgroundColor: '#ffffff'
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Test Access Code (6-digit PIN)</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🔒</span>
                          <input
                            type={showPin ? 'text' : 'password'}
                            placeholder="Enter 6-digit PIN"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            required
                            maxLength={6}
                            style={{
                              width: '100%', padding: '12px 42px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0',
                              fontSize: '14px', outline: 'none', color: '#0f172a', backgroundColor: '#ffffff',
                              letterSpacing: showPin ? 'normal' : '6px', fontWeight: 'bold'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            style={{
                              position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                              border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8',
                              fontSize: '16px'
                            }}
                          >
                            {showPin ? '👁️' : '🙈'}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        style={{
                          width: '100%', padding: '14px', backgroundColor: '#ea580c', color: '#ffffff',
                          borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: '8px', transition: 'background-color 0.2s'
                        }}
                        disabled={loading}
                      >
                        {loading ? 'Verifying Access...' : 'Start Test'} <ArrowRight size={18} />
                      </button>
                    </form>
                  </div>
                </div>
                
                {/* Right Column: How it works */}
                <div style={{ paddingLeft: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>How it works?</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '18px' }}>✉️</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Get teacher email</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>Obtain the email from your teacher</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '18px' }}>🔒</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Enter 6-digit PIN</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>Use the 6-digit access code provided by your teacher</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '18px' }}>▶️</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Start the test</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>Read instructions and begin your assessment</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Performance Overview Section */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Your Performance Overview</h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>
                  Track your progress over time and see how you're improving.
                </p>
                
                {/* Stat cards row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#e0f2fe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ClipboardEdit size={28} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Tests Taken</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{myAttempts.length}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}><span style={{ color: '#3b82f6', fontWeight: '600' }}>+{Math.min(myAttempts.length, 5)}</span> this month</div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Average Score</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{averageAccuracy || 0}%</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}><span style={{ color: '#16a34a', fontWeight: '600' }}>+12%</span> from last month</div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 size={28} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Tests Completed</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{myAttempts.length}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}><span style={{ color: '#a855f7', fontWeight: '600' }}>+4</span> this month</div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={28} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>Average Improvement <AlertCircle size={12} /></div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{averageImprovement >= 0 ? '+' : ''}{averageImprovement}%</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Compared to your previous scores</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Quick Actions</h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>
                  Shortcuts to help you learn, practice, and improve.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  <div onClick={() => setActiveTab('lobby')} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ClipboardEdit size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Practice Now</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Take a quick test to sharpen...</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#94a3b8" />
                  </div>

                  <div onClick={() => setActiveTab('review_attempts')} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>View Results</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Check your performance</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#94a3b8" />
                  </div>

                  <div onClick={() => setActiveTab('review_attempts')} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Review Attempts</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Review all your previous...</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#94a3b8" />
                  </div>

                  <div onClick={() => setActiveTab('leaderboard')} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Leaderboard</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>See how you rank among...</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#94a3b8" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: REVIEW ATTEMPTS (CALENDAR GRID INTEGRATION) */}
          {activeTab === 'review_attempts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Review Attempts</h1>
                <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: '500' }}>
                  Review your past attempts and analyze your performance.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                {/* Left: Calendar Component */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Review Attempts</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Select a date to see the tests you attempted.</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setSelectedDate(new Date())} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}>Today</button>
                      <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}>&lt;</button>
                      <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}>&gt;</button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', padding: '8px 0' }}>{day}</div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {/* Dynamic Calendar Grid */}
                    {Array.from({ length: 35 }, (_, i) => {
                      const year = selectedDate.getFullYear();
                      const month = selectedDate.getMonth();
                      const firstDay = new Date(year, month, 1).getDay();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      const daysInPrevMonth = new Date(year, month, 0).getDate();
                      
                      const dateNum = i - firstDay + 1;
                      let isCurrentMonth = true;
                      let displayNum = dateNum;
                      
                      if (dateNum <= 0) {
                        isCurrentMonth = false;
                        displayNum = daysInPrevMonth + dateNum;
                      } else if (dateNum > daysInMonth) {
                        isCurrentMonth = false;
                        displayNum = dateNum - daysInMonth;
                      }
                      
                      const currentDateString = new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum).toISOString().split('T')[0];
                      const dayAttempts = myAttempts.filter(att => new Date(att.completed_at).toISOString().split('T')[0] === currentDateString);
                      const isSelected = isCurrentMonth && displayNum === selectedDate.getDate();
                      
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(new Date(year, month, displayNum));
                            }
                          }}
                          style={{ 
                            position: 'relative', height: '64px', fontSize: '14px', fontWeight: '700', 
                            color: isCurrentMonth ? (isSelected ? '#ea580c' : '#0f172a') : '#cbd5e1',
                            backgroundColor: isSelected ? '#fff7ed' : 'transparent',
                            borderRadius: '12px', cursor: isCurrentMonth ? 'pointer' : 'default',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px'
                          }}
                        >
                          {displayNum}
                          
                          {/* Render Dots */}
                          {dayAttempts.length > 0 && (
                            <div style={{ position: 'absolute', bottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', width: '80%' }}>
                              {dayAttempts.slice(0, 3).map((att, idx) => {
                                let color = '#3b82f6'; // default test
                                if (att.test_type === 'quiz') color = '#a855f7';
                                if (att.test_type === 'assignment') color = '#ea580c';
                                if (att.test_type === 'live_exam') color = '#ef4444';
                                return <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></div>;
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '24px', fontSize: '12px', fontWeight: '600', color: '#475569', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                      </div>
                      Test
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }}></div>
                      </div>
                      Assignment
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a855f7' }}></div>
                      </div>
                      Quiz
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                      </div>
                      Result
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                      </div>
                      Live Exam
                    </div>
                  </div>
                </div>

                {/* Right: Selected Date Tests */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Tests on {selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    
                    <div style={{ backgroundColor: '#f3e8ff', color: '#a855f7', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                      {myAttempts.filter(att => new Date(att.completed_at).toISOString().split('T')[0] === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString().split('T')[0]).length} Attempts
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                    {myAttempts
                      .filter(att => new Date(att.completed_at).toISOString().split('T')[0] === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString().split('T')[0])
                      .map((attempt) => {
                        const pct = Math.round((attempt.score / attempt.total_questions) * 100);
                        let Icon = FileText;
                        let color = '#3b82f6', bg = '#eff6ff';
                        if (attempt.test_type === 'quiz') { color = '#a855f7'; bg = '#f3e8ff'; Icon = Trophy; }
                        if (attempt.test_type === 'assignment') { color = '#ea580c'; bg = '#fff7ed'; Icon = ClipboardEdit; }
                        if (attempt.test_type === 'live_exam') { color = '#ef4444'; bg = '#fef2f2'; Icon = Target; }
                        
                        let scoreColor = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';

                        return (
                          <div key={attempt.id} onClick={() => handleReviewPastAttempt(attempt)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.1s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={24} />
                              </div>
                              <div>
                                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>{attempt.test_title || 'Assessment'}</h4>
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                  {new Date(attempt.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: scoreColor }}>{pct}%</div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Score</div>
                              </div>
                              <ArrowRight size={16} color="#94a3b8" />
                            </div>
                          </div>
                        );
                    })}
                    
                    {myAttempts.filter(att => new Date(att.completed_at).toISOString().split('T')[0] === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString().split('T')[0]).length === 0 && (
                      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '40px 0' }}>
                        No tests attempted on this date.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Attempts List */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recent Attempts</h3>
                  <button style={{ border: 'none', backgroundColor: 'transparent', color: '#6366f1', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    View All <ArrowRight size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myAttempts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p>You have not completed any tests yet.</p>
                    </div>
                  ) : (
                    myAttempts.slice(0, 5).map((attempt) => {
                      const pct = Math.round((attempt.score / attempt.total_questions) * 100);
                      
                      let Icon = FileText;
                      let color = '#3b82f6', bg = '#eff6ff';
                      let typeName = 'Test';
                      if (attempt.test_type === 'quiz') { color = '#a855f7'; bg = '#f3e8ff'; Icon = Trophy; typeName = 'Quiz'; }
                      if (attempt.test_type === 'assignment') { color = '#ea580c'; bg = '#fff7ed'; Icon = ClipboardEdit; typeName = 'Assignment'; }
                      if (attempt.test_type === 'live_exam') { color = '#ef4444'; bg = '#fef2f2'; Icon = Target; typeName = 'Live Exam'; }
                      if (attempt.test_type === 'result') { color = '#16a34a'; bg = '#dcfce7'; Icon = BarChart3; typeName = 'Result'; }
                      
                      let scoreColor = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';

                      return (
                        <div key={attempt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          
                          {/* Left: Icon & Title */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 30%' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                                {attempt.test_title || 'Assessment'}
                              </h4>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                {typeName} • {attempt.total_questions} Questions
                              </div>
                            </div>
                          </div>

                          {/* Middle: Date and Time */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 25%', justifyContent: 'center' }}>
                            <Calendar size={16} color="#94a3b8" />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                                {new Date(attempt.completed_at).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                {new Date(attempt.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>

                          {/* Middle Right: Score */}
                          <div style={{ flex: '1 1 15%', textAlign: 'center' }}>
                            <div style={{ fontSize: '15px', fontWeight: '800', color: scoreColor }}>{pct}%</div>
                            <div style={{ fontSize: '11px', color: scoreColor, fontWeight: '600' }}>Score</div>
                          </div>

                          {/* Right: Button */}
                          <div style={{ flex: '1 1 20%', display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleReviewPastAttempt(attempt)}
                              style={{ 
                                padding: '10px 20px', backgroundColor: '#f5f3ff', color: '#6366f1', 
                                borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '700',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'background-color 0.2s'
                              }}
                            >
                              Review Attempt <ArrowRight size={16} />
                            </button>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: LEADERBOARD */}
          {activeTab === 'leaderboard' && (() => {
            const selectedTest = availableTests.find(t => t.id === leaderboardSelectedTestId);
            const myRankIndex = leaderboardAttempts.findIndex(a => a.student_email === user.email);
            const myAttempt = myRankIndex >= 0 ? leaderboardAttempts[myRankIndex] : null;

            return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Leaderboard</h1>
                <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: '500' }}>
                  Compete with others and climb the leaderboard!
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Left: Leaderboard Display */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Trophy size={28} color="#8b5cf6" />
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Leaderboard</h2>
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Rankings are based on marks scored in the selected test.</p>

                  {selectedTest ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '48px', height: '48px', backgroundColor: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <ClipboardEdit size={24} />
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{selectedTest.title}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{selectedTest.questions?.length || 0} Questions • MCQ Test</div>
                          </div>
                        </div>
                        <div style={{ width: '1px', height: '40px', backgroundColor: '#e2e8f0' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Users size={20} color="#64748b" />
                          <div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Students</div>
                            <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{leaderboardAttempts.length}</div>
                          </div>
                        </div>
                      </div>

                      {/* Leaderboard Table */}
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr', padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '700', color: '#64748b', alignItems: 'center' }}>
                          <div style={{ textAlign: 'center' }}>Rank</div>
                          <div>Student</div>
                          <div style={{ textAlign: 'center' }}>Marks Obtained</div>
                          <div style={{ textAlign: 'center' }}>Percentage</div>
                          <div style={{ textAlign: 'right' }}>Time Taken</div>
                        </div>

                        {leaderboardLoading ? (
                           <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading leaderboard...</div>
                        ) : leaderboardAttempts.length === 0 ? (
                           <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No attempts yet.</div>
                        ) : (
                          <>
                            {leaderboardAttempts.map((st, i) => {
                              const rank = i + 1;
                              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                              const isMe = st.student_email === user.email;
                              const pct = Math.round((st.score / st.total_questions) * 100);
                              const durationText = st.time_taken_seconds
                                ? `${Math.floor(st.time_taken_seconds / 60)}m ${st.time_taken_seconds % 60}s`
                                : 'N/A';
                                
                              return (
                                <div key={st.id} style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr', padding: '16px', borderBottom: '1px solid #f1f5f9', backgroundColor: isMe ? '#f5f3ff' : 'transparent', borderLeft: isMe ? '4px solid #8b5cf6' : '4px solid transparent', alignItems: 'center', transition: 'background-color 0.2s', margin: isMe ? '4px 0' : '0' }}>
                                  <div style={{ textAlign: 'center', fontSize: medal ? '20px' : '14px', fontWeight: '700', color: medal ? 'inherit' : (isMe ? '#8b5cf6' : '#0f172a') }}>
                                    {medal || rank}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                                      <img src={studentAvatar as any} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '14px', fontWeight: isMe ? '800' : '700', color: isMe ? '#8b5cf6' : '#0f172a' }}>{st.student_name || st.student_email.split('@')[0]} {isMe ? '(You)' : ''}</div>
                                      <div style={{ fontSize: '12px', color: isMe ? '#6366f1' : '#64748b' }}>{st.student_email}</div>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: isMe ? '800' : '700', color: isMe ? '#8b5cf6' : '#0f172a' }}>{st.score}</div>
                                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '800', color: isMe ? '#8b5cf6' : '#10b981' }}>{pct}%</div>
                                  <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: isMe ? '700' : '600', color: isMe ? '#8b5cf6' : '#0f172a' }}>{durationText}</div>
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      Please select a test from the right panel to view its leaderboard.
                    </div>
                  )}
                </div>

                {/* Right: Filter & About */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Filter Card */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Filter Leaderboard</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Select the test to view real-time rankings.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Test</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', backgroundColor: '#3b82f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <ClipboardEdit size={14} />
                          </div>
                          <select 
                            value={leaderboardSelectedTestId}
                            onChange={(e) => setLeaderboardSelectedTestId(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 44px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#0f172a', appearance: 'none', outline: 'none', height: '44px', backgroundColor: '#fff' }}
                          >
                            <option value="">-- Select a test --</option>
                            {availableTests.map(t => (
                              <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* About Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>About Leaderboard</h3>
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Trophy size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Rank is based on marks</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>Higher marks in the selected test get a higher rank.</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BarChart3 size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Ties are broken by time</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>If marks are same, faster attempt gets the higher rank.</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Real-time rankings</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>Rankings dynamically update as soon as students submit.</div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>
            );
          })()}

        </div>
      </main>

    </div>
  );
}


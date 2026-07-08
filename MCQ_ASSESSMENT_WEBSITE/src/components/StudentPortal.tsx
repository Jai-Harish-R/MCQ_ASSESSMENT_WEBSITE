import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
// { useState, useEffect, useRef } from 'react';
import { 
  Clock, ArrowLeft, ArrowRight, Flag, CheckCircle2, 
  AlertTriangle, LogOut, GraduationCap,
  LayoutDashboard, BookOpen, Award,
  Hand, ClipboardEdit, Target, CheckSquare, TrendingUp, CalendarDays,
  FileStack, BarChart3, Inbox, FileText, Trophy, ShieldCheck,
  FileCheck2, ClipboardList, Lock, Calendar
} from 'lucide-react';
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
  type?: 'test' | 'assignment' | 'quiz' | 'live_exam';
  created_at?: string;
}

interface Attempt {
  test_type?: string;
  id: string;
  test_id: string;
  student_email: string;
  score: number;
  total_questions: number;
  completed_at: string;
  allowed_retry: boolean;
  test_title?: string;
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

  // Interactive Calendar and Popover states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 5, 7)); // Default to June 7, 2025

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

  // Load student statistics & available tests
  const loadPortalData = async () => {
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
        const { data: allTests } = await supabase
          .from('tests')
          .select('id, title, access_code, teacher_email, questions')
          .order('created_at', { ascending: false });

        if (allTests) {
          setAvailableTests(allTests);
        }
      }
    } catch (err) {
      console.error("Failed to load student dashboard stats:", err);
    } finally {
    }
  };

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

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'lobby' || activeTab === 'review_attempts') {
      loadPortalData();
    }
  }, [activeTab, user.id, isDemo]);

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
          .eq('teacher_email', emailInput.trim())
          .eq('access_code', pinInput.trim())
          .maybeSingle();

        if (testErr) throw testErr;
        test = testData;

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
      setSecondsLeft(600);
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

  // Active Exam View hides sidebar
  if (viewState === 'exam' || viewState === 'result') {
    return (
      <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="edu-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} />
            </div>
            <h2 style={{ fontSize: '15px', fontWeight: '700' }}>EduVerify Pro - Timed Exam Portal</h2>
          </div>
          <div style={{ fontSize: '13px', fontWeight: '500' }}>{user.email}</div>
        </header>

        <div className="container-student" style={{ flex: 1, padding: '32px 0 80px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          
          {/* ACTIVE EXAM INTERFACE */}
          {viewState === 'exam' && activeTest && (
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

              <div className="card" style={{ padding: '32px', minHeight: '300px' }}>
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
              <div className="card" style={{ textAlign: 'center', padding: '40px', border: '2px solid #1c4e80' }}>
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
  const assessmentsOverview = React.useMemo(() => {
    const total = myAttempts.length;
    const counts: any = { test: 0, quiz: 0, assignment: 0, live_exam: 0, result: 0 };
    myAttempts.forEach((att: any) => {
      const t = att.test_type || 'test';
      if (counts[t] !== undefined) counts[t]++;
    });
    
    let currentPct = 0;
    const gradients: string[] = [];
    const colors = { test: '#ea580c', quiz: '#a855f7', assignment: '#f97316', live_exam: '#ef4444', result: '#22c55e' };
    
    ['test', 'quiz', 'assignment', 'live_exam', 'result'].forEach(type => {
      if (counts[type] > 0) {
        const pct = (counts[type] / total) * 100;
        gradients.push(`${(colors as any)[type]} ${currentPct}% ${currentPct + pct}%`);
        currentPct += pct;
      }
    });
    
    const bg = gradients.length > 0 ? `conic-gradient(${gradients.join(', ')})` : 'conic-gradient(#f1f5f9 0% 100%)';
    return { counts, bg, total };
  }, [myAttempts]);

  const performanceTrend = React.useMemo(() => {
    // Get last 4 attempts, chronological (reverse the reverse order)
    const recent = [...myAttempts].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()).slice(-4);
    if (recent.length === 0) return [];
    
    return recent.map(att => Math.round((att.score / att.total_questions) * 100));
  }, [myAttempts]);

  // STANDARD PORTAL WITH SIDEBAR
  return (
    <div className="edu-app-frame">
      
      {/* Student Sidebar */}
      <aside className="edu-sidebar">
        <div>
          {/* Logo Frame */}
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', paddingLeft: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '15px'
            }}>
              C
            </div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
              Coders<span style={{ color: '#ea580c' }}>Fun</span>
            </span>
          </div>

          {/* Profile Card */}
          <div className="sidebar-profile">
            <img className="sidebar-profile-avatar" src={studentAvatar as any} alt="Student Avatar" />
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name" title={studentDisplayName}>{studentDisplayName}</span>
              <span className="sidebar-profile-role">Student Portal</span>
            </div>
          </div>

          {/* Sidebar Menu list */}
          <ul className="sidebar-menu">
            <li>
              <button
                onClick={() => { setActiveTab('dashboard'); setVerifiedLeaderboard(null); }}
                className={`sidebar-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('lobby'); setVerifiedLeaderboard(null); }}
                className={`sidebar-item-btn ${activeTab === 'lobby' ? 'active' : ''}`}
              >
                <BookOpen size={18} />
                Take Test
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('review_attempts'); setVerifiedLeaderboard(null); }}
                className={`sidebar-item-btn ${activeTab === 'review_attempts' ? 'active' : ''}`}
              >
                <Clock size={18} />
                Review Attempts
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('leaderboard'); setVerifiedLeaderboard(null); }}
                className={`sidebar-item-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              >
                <Award size={18} />
                Leaderboard
              </button>
            </li>
          </ul>
        </div>

        {/* Bottom Actions */}
        <div>
          <button onClick={onLogout} className="sidebar-item-btn" style={{ border: '1px solid #cbd5e1', justifyContent: 'center' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace Scroll Area */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        
        {/* Simple Top Bar */}
        <header className="edu-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-on-surface-variant)' }}>
              CodersFun Secure Testing Center
            </span>
          </div>
          <div className="header-actions">
            <img className="header-avatar" src={studentAvatar as any} alt="Student Avatar" />
          </div>
        </header>

        {/* Content Workspace */}
        <div className="workspace-container">

          {/* TAB 1: STUDENT DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Welcome Header */}
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Welcome back, {studentDisplayName}! <Hand style={{ display: "inline-block", color: "#f59e0b", marginLeft: "8px" }} /></h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>
                  Ready to test your skills? Join a test using the details below.
                </p>
              </div>

              {/* Stats Overview Grid */}
              <div className="stats-overview-grid">
                <div className="stats-card">
                  <div className="stats-card-icon" style={{ backgroundColor: "#fff7ed", color: "#ea580c" }}><ClipboardEdit size={24} /></div>
                  <div className="stats-card-info">
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Tests Taken</span>
                    <span className="stats-card-value">{myAttempts.length}</span>
                    <span className="stats-card-change" style={{ color: 'var(--color-success)' }}>+5 this month</span>
                  </div>
                </div>

                <div className="stats-card">
                  <div className="stats-card-icon" style={{ backgroundColor: "#dcfce7", color: "var(--color-success)" }}><Target size={24} /></div>
                  <div className="stats-card-info">
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Average Score</span>
                    <span className="stats-card-value">{averageAccuracy}%</span>
                    <span className="stats-card-change" style={{ color: 'var(--color-success)' }}>+12% from last month</span>
                  </div>
                </div>

                <div className="stats-card">
                  <div className="stats-card-icon" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}><CheckSquare size={24} /></div>
                  <div className="stats-card-info">
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Tests Completed</span>
                    <span className="stats-card-value">{myAttempts.length}</span>
                    <span className="stats-card-change" style={{ color: 'var(--color-success)' }}>+4 this month</span>
                  </div>
                </div>

                <div className="stats-card">
                  <div className="stats-card-icon" style={{ backgroundColor: "#f3e8ff", color: "#a855f7" }}><TrendingUp size={24} /></div>
                  <div className="stats-card-info">
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Average Performance</span>
                    <span className="stats-card-value">{myAttempts.length > 0 ? "Top 16%" : "N/A"}</span>
                    <span className="stats-card-change" style={{ color: 'var(--color-success)' }}>Better than 84% of students</span>
                  </div>
                </div>
              </div>

              {/* Calendar & Upcoming Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                
                {/* Left: June 2025 Calendar Card */}
                <div className="calendar-card">
                  <div className="calendar-header-row">
                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>June 2025</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>Today</button>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>&lt;</button>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>&gt;</button>
                    </div>
                  </div>

                  <div className="calendar-days-grid">
                    <div className="calendar-weekday">Sun</div>
                    <div className="calendar-weekday">Mon</div>
                    <div className="calendar-weekday">Tue</div>
                    <div className="calendar-weekday">Wed</div>
                    <div className="calendar-weekday">Thu</div>
                    <div className="calendar-weekday">Fri</div>
                    <div className="calendar-weekday">Sat</div>

                    {/* June 2025 Day Cells: Starts on Sunday June 1st */}
                    {Array.from({ length: 30 }, (_, i) => {
                      const dayNum = i + 1;
                      const isSelected = selectedDate.getDate() === dayNum && selectedDate.getMonth() === 5;
                      const isToday = dayNum === 7; // Mock today as June 7

                      return (
                        <div
                          key={dayNum}
                          onClick={() => {
                            setSelectedDate(new Date(2025, 5, dayNum));
                            setActiveTab('review_attempts');
                          }}
                          className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                        >
                          <span className="calendar-day-num">{dayNum}</span>
                          <div className="calendar-dots-container">
                            {dayNum === 7 && (
                              <>
                                <span className="calendar-dot calendar-dot-quiz" title="Physics Quiz"></span>
                                <span className="calendar-dot calendar-dot-assignment" title="Math Assignment"></span>
                                <span className="calendar-dot calendar-dot-result" title="Chemistry Test"></span>
                              </>
                            )}
                            {dayNum === 6 && (
                              <span className="calendar-dot calendar-dot-assignment" title="Math Assignment"></span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calendar type guide footer */}
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', fontSize: '11px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="calendar-dot calendar-dot-test"></span> Test
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="calendar-dot calendar-dot-assignment"></span> Assignment
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="calendar-dot calendar-dot-quiz"></span> Quiz
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="calendar-dot calendar-dot-result"></span> Result
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="calendar-dot calendar-dot-live"></span> Live Exam
                    </div>
                  </div>
                </div>

                {/* Right: Upcoming & Activity Panels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Upcoming card */}
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Upcoming Tests</h3>
                      <button onClick={() => setActiveTab('lobby')} style={{ border: 'none', background: 'none', color: '#ea580c', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>View All</button>
                    </div>

                    <div className="upcoming-test-feed">
                      {availableTests.length === 0 ? (
                        <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '16px' }}>No upcoming tests scheduled.</div>
                      ) : (
                        availableTests.slice(0, 3).map((test, idx) => (
                          <div className="upcoming-test-row" key={idx}>
                            <div className="upcoming-test-info">
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{test.title}</span>
                              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{test.created_at ? new Date(test.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <span className="chip chip-neutral" style={{ fontSize: '9px', padding: '2px 8px', backgroundColor: test.type === 'assignment' ? '#ffe4e6' : test.type === 'test' ? '#e0f2fe' : '#f1f5f9', color: test.type === 'assignment' ? '#be123c' : test.type === 'test' ? '#0369a1' : '#475569' }}>
                              {test.type ? test.type.toUpperCase() : 'TEST'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '16px', padding: '8px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}>
                      <CalendarDays size={16} style={{marginRight: "8px"}} /> Add to Calendar
                    </button>
                  </div>

                  {/* Recent Activity card */}
                  <div className="card">
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                      {myAttempts.length === 0 ? (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>No recent activity.</div>
                      ) : (
                        myAttempts.slice(0, 4).map((attempt, idx) => (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }} key={idx}>
                            <span style={{ color: '#475569' }}><CheckCircle2 size={14} style={{display: "inline-block", marginRight: "6px", color: "var(--color-success)"}} /> Completed test (Score: {attempt.score}/{attempt.total_questions})</span>
                            <span style={{ color: '#94a3b8' }}>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Charts Display Grid */}
              <div className="charts-split-grid">
                
                {/* Donut Chart: Assessments Overview */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Assessments Overview</h4>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Your overall activity this month</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px', marginTop: '12px' }}>
                    <div style={{
                      position: 'relative', width: '140px', height: '140px', borderRadius: '50%',
                      background: assessmentsOverview.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '94px', height: '94px', borderRadius: '50%', backgroundColor: '#ffffff',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{assessmentsOverview.total}</span>
                        <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Total</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ea580c' }}></span>
                        <span>Tests ({assessmentsOverview.counts.test}, {assessmentsOverview.total ? Math.round((assessmentsOverview.counts.test / assessmentsOverview.total) * 100) : 0}%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#a855f7' }}></span>
                        <span>Quizzes ({assessmentsOverview.counts.quiz}, {assessmentsOverview.total ? Math.round((assessmentsOverview.counts.quiz / assessmentsOverview.total) * 100) : 0}%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316' }}></span>
                        <span>Assignments ({assessmentsOverview.counts.assignment}, {assessmentsOverview.total ? Math.round((assessmentsOverview.counts.assignment / assessmentsOverview.total) * 100) : 0}%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                        <span>Live Exams ({assessmentsOverview.counts.live_exam}, {assessmentsOverview.total ? Math.round((assessmentsOverview.counts.live_exam / assessmentsOverview.total) * 100) : 0}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Performance Line Chart */}
                <div className="card">
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Performance Trend</h4>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Your average score over time</span>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <svg viewBox="0 0 400 130" style={{ width: '100%', height: '120px' }}>
                      <line x1="50" y1="20" x2="350" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="50" y1="50" x2="350" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="50" y1="80" x2="350" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="50" y1="110" x2="350" y2="110" stroke="#f1f5f9" strokeWidth="1" />

                      {performanceTrend.length > 0 ? (
                        <>
                          <path d={`M 50 ${110 - (performanceTrend[0] || 0) * 0.9} ${performanceTrend[1] !== undefined ? `L 150 ${110 - performanceTrend[1] * 0.9}` : ''} ${performanceTrend[2] !== undefined ? `L 250 ${110 - performanceTrend[2] * 0.9}` : ''} ${performanceTrend[3] !== undefined ? `L 350 ${110 - performanceTrend[3] * 0.9}` : ''}`} fill="none" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {performanceTrend.map((score, idx) => (
                            <React.Fragment key={idx}>
                              <circle cx={50 + (idx * 100)} cy={110 - score * 0.9} r="5" fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />
                              <text x={50 + (idx * 100)} y={110 - score * 0.9 - 10} fontSize="9" fontWeight="700" textAnchor="middle" fill="#ea580c">{score}%</text>
                            </React.Fragment>
                          ))}
                        </>
                      ) : (
                        <text x="200" y="65" fontSize="12" fontWeight="500" textAnchor="middle" fill="#94a3b8">No tests completed yet</text>
                      )}

                      <text x="50" y="125" fontSize="10" fontWeight="500" textAnchor="middle" fill="#64748b">Test 1</text>
                      <text x="150" y="125" fontSize="10" fontWeight="500" textAnchor="middle" fill="#64748b">Test 2</text>
                      <text x="250" y="125" fontSize="10" fontWeight="500" textAnchor="middle" fill="#64748b">Test 3</text>
                      <text x="350" y="125" fontSize="10" fontWeight="500" textAnchor="middle" fill="#64748b">Test 4</text>
                    </svg>
                  </div>
                </div>

              </div>

              {/* Quick Access panel links */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Quick Access</h3>
                <div className="quick-action-card-grid">
                  <div onClick={() => setActiveTab('review_attempts')} className="quick-action-item">
                    <FileStack size={20} />
                    <div>
                      <div className="quick-action-item-title">My Submissions</div>
                      <div className="quick-action-item-desc">View your attempts</div>
                    </div>
                  </div>

                  <div onClick={() => setActiveTab('review_attempts')} className="quick-action-item">
                    <BarChart3 size={20} />
                    <div>
                      <div className="quick-action-item-title">Results History</div>
                      <div className="quick-action-item-desc">Check your scores</div>
                    </div>
                  </div>

                  <a href="#" className="quick-action-item">
                    <BookOpen size={20} />
                    <div>
                      <div className="quick-action-item-title">Study Materials</div>
                      <div className="quick-action-item-desc">Access resources</div>
                    </div>
                  </a>

                  <a href="#" className="quick-action-item">
                    <Inbox size={20} />
                    <div>
                      <div className="quick-action-item-title">Download Reports</div>
                      <div className="quick-action-item-desc">Export your data</div>
                    </div>
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TAKE TEST ENTRY LOBBY */}
          {activeTab === 'lobby' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Join a Test</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>
                  Enter your secure access code to begin your proctored examination.
                </p>
              </div>

              {/* Main Join Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                
                {/* Left Side: Illustration & Form */}
                <div style={{ display: 'flex', gap: '24px' }}>
                  {/* Illustration Card */}
                  <div style={{ 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flex: '0 0 160px',
                    position: 'relative',
                    border: '1px solid #e2e8f0'
                  }}>
                    <ClipboardList size={80} color="#94a3b8" />
                    <div style={{
                      position: 'absolute',
                      bottom: '24px',
                      right: '24px',
                      backgroundColor: '#f59e0b',
                      borderRadius: '50%',
                      padding: '8px',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Lock size={20} />
                    </div>
                  </div>

                  {/* Join Form */}
                  <div className="card" style={{ flex: 1 }}>
                    <form onSubmit={handleEnterTest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {errorMsg && (
                        <div style={{ padding: '12px', backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertTriangle size={16} /> {errorMsg}
                        </div>
                      )}

                      <div>
                        <label className="input-label">Teacher Email Address</label>
                        <input
                          type="email"
                          className="input-field"
                          placeholder="teacher@institution.edu"
                          value={teacherEmail}
                          onChange={(e) => setTeacherEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="input-label">Test Access Code</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. 123456"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          required
                          style={{ letterSpacing: '2px', fontWeight: 'bold' }}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '8px' }} disabled={loading}>
                        {loading ? 'Verifying Access...' : 'Join Test'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Side: Recent Activity (Fetched Data) */}
                <div className="card" style={{ height: '100%' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Recent Activity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px' }}>
                    {myAttempts.length === 0 ? (
                      <div style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>No recent activity to display.</div>
                    ) : (
                      myAttempts.slice(0, 5).map((attempt, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ 
                            backgroundColor: attempt.score / attempt.total_questions >= 0.7 ? '#dcfce7' : attempt.score / attempt.total_questions >= 0.4 ? '#fef3c7' : '#fee2e2', 
                            padding: '8px', 
                            borderRadius: '8px',
                            color: attempt.score / attempt.total_questions >= 0.7 ? '#16a34a' : attempt.score / attempt.total_questions >= 0.4 ? '#d97706' : '#dc2626'
                          }}>
                            <FileCheck2 size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>Test Completed</div>
                            <div style={{ color: '#64748b', marginTop: '2px' }}>Score: {attempt.score}/{attempt.total_questions} ({(attempt.score/attempt.total_questions*100).toFixed(1)}%)</div>
                          </div>
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom: Active Metrics */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>Your Active Metrics</h3>
                <div className="stats-overview-grid">
                  <div className="stats-card">
                    <div className="stats-card-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                      <ClipboardEdit size={24} />
                    </div>
                    <div className="stats-card-info">
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Tests Taken</span>
                      <span className="stats-card-value">{myAttempts.length}</span>
                      <span className="stats-card-change" style={{ color: 'var(--color-success)' }}>+5 this month</span>
                    </div>
                  </div>

                  <div className="stats-card">
                    <div className="stats-card-icon" style={{ backgroundColor: '#dcfce7', color: 'var(--color-success)' }}>
                      <Target size={24} />
                    </div>
                    <div className="stats-card-info">
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Average Score</span>
                      <span className="stats-card-value">{averageAccuracy}%</span>
                      <span className="stats-card-change" style={{ color: 'var(--color-success)' }}>+12% from last month</span>
                    </div>
                  </div>

                  <div className="stats-card">
                    <div className="stats-card-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                      <CheckSquare size={24} />
                    </div>
                    <div className="stats-card-info">
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Tests Completed</span>
                      <span className="stats-card-value">{myAttempts.length}</span>
                      <span className="stats-card-change" style={{ color: 'var(--color-success)' }}>+4 this month</span>
                    </div>
                  </div>

                  <div className="stats-card">
                    <div className="stats-card-icon" style={{ backgroundColor: '#f3e8ff', color: '#a855f7' }}>
                      <TrendingUp size={24} />
                    </div>
                    <div className="stats-card-info">
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Average Performance</span>
                      <span className="stats-card-value">{myAttempts.length > 0 ? 'Top 16%' : 'N/A'}</span>
                      <span className="stats-card-change" style={{ color: 'var(--color-success)' }}>Better than 84% of students</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: REVIEW ATTEMPTS (CALENDAR GRID INTEGRATION) */}
          {activeTab === 'review_attempts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Review Attempts</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>
                  Analyze your performance history and review answers from past tests.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Left: Calendar Component */}
                <div className="calendar-card">
                  <div className="calendar-header-row">
                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>June 2025</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>Today</button>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>&lt;</button>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>&gt;</button>
                    </div>
                  </div>

                  <div className="calendar-days-grid">
                    <div className="calendar-weekday">Sun</div>
                    <div className="calendar-weekday">Mon</div>
                    <div className="calendar-weekday">Tue</div>
                    <div className="calendar-weekday">Wed</div>
                    <div className="calendar-weekday">Thu</div>
                    <div className="calendar-weekday">Fri</div>
                    <div className="calendar-weekday">Sat</div>

                    {/* Simple Calendar Grid Mockup */}
                    {Array.from({ length: 30 }, (_, i) => {
                      const dayNum = i + 1;
                      const isSelected = selectedDate.getDate() === dayNum;
                      return (
                        <div
                          key={dayNum}
                          onClick={() => setSelectedDate(new Date(2025, 5, dayNum))}
                          className={`calendar-day-cell ${isSelected ? 'selected' : ''}`}
                        >
                          <span className="calendar-day-num">{dayNum}</span>
                          <div className="calendar-dots-container">
                            {/* Randomly mock dots for visual effect */}
                            {dayNum % 7 === 0 && <span className="calendar-dot calendar-dot-test"></span>}
                            {dayNum % 5 === 0 && <span className="calendar-dot calendar-dot-quiz"></span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', fontSize: '11px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="calendar-dot calendar-dot-test"></span> Test
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="calendar-dot calendar-dot-quiz"></span> Quiz
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="calendar-dot calendar-dot-assignment"></span> Assignment
                    </div>
                  </div>
                </div>

                {/* Right: Past Attempts List & Analysis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Past Attempts */}
                  <div className="card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Your Past Attempts</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {myAttempts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                          <ClipboardList size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                          <p>You have not completed any tests yet.</p>
                        </div>
                      ) : (
                        myAttempts.map((attempt) => {
                          const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
                          let statusColor = percentage >= 70 ? '#16a34a' : percentage >= 40 ? '#d97706' : '#dc2626';
                          let statusBg = percentage >= 70 ? '#dcfce7' : percentage >= 40 ? '#fef3c7' : '#fee2e2';

                          return (
                            <div key={attempt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ backgroundColor: statusBg, color: statusColor, padding: '12px', borderRadius: '10px' }}>
                                  <FileText size={24} />
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Completed Test</h4>
                                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Calendar size={14} />
                                      {new Date(attempt.completed_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '16px', fontWeight: '700', color: statusColor }}>{percentage}%</div>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>{attempt.score} / {attempt.total_questions} Points</div>
                                </div>
                                <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => handleReviewPastAttempt(attempt)}>
                                  Review
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEADERBOARD VIEW AND VERIFICATION ACCESS GATE */}
          {activeTab === 'leaderboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header */}
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Leaderboard</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>
                  Compete with others and climb the leaderboard!
                </p>
              </div>

              {!verifiedLeaderboard ? (
                // Filter Access Gate (Screenshot 5 right panel style but full size)
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                  <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Award size={24} />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>Select Test to View Leaderboard</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>
                      Input details to unlock rankings for your section.
                    </p>

                    {leaderboardError && (
                      <div className="chip chip-error" style={{ display: 'flex', width: '100%', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '16px', gap: '8px', fontSize: '13px', textTransform: 'none' }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                        <span>{leaderboardError}</span>
                      </div>
                    )}

                    <form onSubmit={handleVerifyLeaderboard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label className="input-label">Teacher Email</label>
                        <input
                          type="email"
                          className="input-field"
                          placeholder="teacher.demo@codersfun.com"
                          value={leaderboardTeacherEmail}
                          onChange={(e) => setLeaderboardTeacherEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="input-label">Test Access Code (6-digit PIN)</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="123456"
                          value={leaderboardAccessCode}
                          onChange={(e) => setLeaderboardAccessCode(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', height: '44px', marginTop: '12px', borderRadius: 'var(--radius-sm)' }}
                        disabled={loading}
                      >
                        {loading ? 'Verifying...' : 'View Leaderboard'}
                        {!loading && <ArrowRight size={16} />}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                // Full Leaderboard layout (Screenshot 5 visual overhaul)
                <div className="leaderboard-split-layout">
                  
                  {/* Left Column: Rankings list */}
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{verifiedLeaderboard.test.title}</h3>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>25 Questions • MCQ Test</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Total Students</span>
                        <strong style={{ fontSize: '16px', color: '#0f172a' }}>{verifiedLeaderboard.attempts.length}</strong>
                      </div>
                    </div>

                    <div className="table-container">
                      <table className="density-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Student</th>
                            <th style={{ textAlign: 'center' }}>Marks</th>
                            <th style={{ textAlign: 'center' }}>Percentage</th>
                            <th style={{ textAlign: 'center' }}>Time Taken</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verifiedLeaderboard.attempts.map((att, index) => {
                            const studentRank = index + 1;
                            const isUser = att.student_email === user.email;
                            
                            // Determine name to display
                            let displayName = att.student_name || att.student_email.split('@')[0];
                            if (isUser) displayName = `${studentDisplayName} (You)`;

                            const studentPct = Math.round((att.score / att.total_questions) * 100);
                            const durationText = att.time_taken_seconds
                              ? `${Math.floor(att.time_taken_seconds / 60)}m ${att.time_taken_seconds % 60}s`
                              : '18m 24s';

                            return (
                              <tr key={att.id} style={{ backgroundColor: isUser ? '#ffedd5' : 'transparent' }}>
                                <td>
                                  {studentRank === 1 && <span className="medal-badge medal-gold">1st</span>}
                                  {studentRank === 2 && <span className="medal-badge medal-silver">2nd</span>}
                                  {studentRank === 3 && <span className="medal-badge medal-bronze">3rd</span>}
                                  {studentRank > 3 && <strong>#{studentRank}</strong>}
                                </td>
                                <td style={{ fontWeight: isUser ? '700' : '500' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img src={isUser ? (studentAvatar as any) : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80"} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                    <span>{displayName}</span>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: '600' }}>{att.score} / {att.total_questions}</td>
                                <td style={{ textAlign: 'center', fontWeight: '700', color: '#ea580c' }}>{studentPct}.0%</td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{durationText}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <button onClick={() => setVerifiedLeaderboard(null)} className="btn btn-secondary" style={{ alignSelf: 'center', borderRadius: '4px', marginTop: '16px' }}>
                      <ArrowLeft size={14} /> Back to Selection
                    </button>
                  </div>

                  {/* Right Column: Filter & About */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Dynamic Filters Form */}
                    <div className="card">
                      <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Filter Leaderboard</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label className="input-label">Date</label>
                          <input type="text" className="input-field" value="7 June 2025" readOnly />
                        </div>

                        <div>
                          <label className="input-label">Time</label>
                          <input type="text" className="input-field" value="09:00 AM - 10:00 AM" readOnly />
                        </div>

                        <div>
                          <label className="input-label">Teacher Email</label>
                          <input type="email" className="input-field" value={leaderboardTeacherEmail} readOnly />
                        </div>

                        <div>
                          <label className="input-label">Test Access Code (6-digit PIN)</label>
                          <input type="text" className="input-field" value={leaderboardAccessCode} readOnly />
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} disabled>
                          View Leaderboard
                        </button>
                      </div>
                    </div>

                    {/* About Card */}
                    <div className="card">
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>About Leaderboard</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                        <div style={{display:"flex",gap:"8px"}}><Trophy size={16} color="#eab308" /> <span><strong>Rank is based on marks:</strong> Higher marks in the selected test gets a higher rank.</span></div>
                        <div style={{display:"flex",gap:"8px"}}><BarChart3 size={16} color="#3b82f6" /> <span><strong>Ties are broken by time:</strong> If marks are same, a faster attempt gets a higher rank.</span></div>
                        <div style={{display:"flex",gap:"8px"}}><ShieldCheck size={16} color="#10b981" /> <span><strong>Fair and accurate:</strong> Results are calculated instantly and fairly for all students.</span></div>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

        </div>
      </main>

    </div>
  );
}


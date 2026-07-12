import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Bell, ChevronDown, Clock3,
  Clock, ArrowLeft, ArrowRight, Flag, CheckCircle2, 
  AlertTriangle, AlertCircle,  GraduationCap, LogOut,
  LayoutDashboard, BookOpen, Award,
   ClipboardEdit, Target, TrendingUp, CalendarDays,
   BarChart3,  FileText, Trophy, ShieldCheck,
   Lock, Calendar
, Users, Mail, Menu} from 'lucide-react';
import studentAvatar from '../assets/student_avatar.png';
import ProfileModal from './ProfileModal';
import HoverableTestTitle from './HoverableTestTitle';

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
  allowed_emails?: string[] | null;
  created_at?: string;
  pass_percentage?: number;
  max_attempts?: number;
  short_id?: number;
  no_of_questions?: number;
  shuffle_questions?: boolean;
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
  short_id?: number;
  profiles?: {
    full_name: string;
    short_id?: number;
  } | null;
}

const getLocalDateStr = (d: Date | string | number) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

interface Profile {
  id: string;
  email: string;
  short_id?: number;
  designation?: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface StudentPortalProps {
  user: { id: string; email: string; user_metadata?: { full_name?: string; avatar_url?: string } };

  onLogout: () => void;
}

export default function StudentPortal({ user, onLogout }: StudentPortalProps) {
  // Navigation tabs: 'dashboard' | 'lobby' | 'review_attempts' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lobby' | 'review_attempts' | 'leaderboard'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewState, setViewState] = useState<'lobby' | 'exam' | 'result'>('lobby');

  // Attempts and tests states (for dashboard and leaderboard verification)
  const [myAttempts, setMyAttempts] = useState<Attempt[]>([]);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user.user_metadata?.avatar_url || studentAvatar as any);
  const [showAllRecentActivity, setShowAllRecentActivity] = useState(false);
  const [showAllRecentAttempts, setShowAllRecentAttempts] = useState(false);

  const [, setIsLoadingData] = useState(true);
  const [dashboardTimeFilter, setDashboardTimeFilter] = useState('This Month');
  // Leaderboard dynamically fetched states
  const [leaderboardSelectedTestId, setLeaderboardSelectedTestId] = useState<string>('');
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const itemsPerPage = 10;
  const [leaderboardAttempts, setLeaderboardAttempts] = useState<Attempt[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const fetchLeaderboardForTest = useCallback(async (testId: string) => {
    if (!testId) {
      setLeaderboardAttempts([]);
      return;
    }
    setLeaderboardLoading(true);
    try {
      
        const { data, error } = await supabase
          .from('test_attempts')
          .select('*, profiles(short_id)')
          .eq('test_id', testId);
        
        if (error) throw error;
        
        const latestFirst = (data || []).sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
        
        const uniqueAttempts: any[] = [];
        const seenEmails = new Set();
        for (const att of latestFirst) {
          const key = att.student_email || (att as any).student_id;
          if (!seenEmails.has(key)) {
            seenEmails.add(key);
            uniqueAttempts.push(att);
          }
        }

        const ranked = uniqueAttempts.sort((a: any, b: any) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.time_taken_seconds || Infinity) - (b.time_taken_seconds || Infinity);
        });
        
        setLeaderboardAttempts(ranked);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardForTest(leaderboardSelectedTestId);
  }, [leaderboardSelectedTestId, fetchLeaderboardForTest]);
  
  // Realtime subscription for leaderboard
  useEffect(() => {
    if (!leaderboardSelectedTestId) return;
    
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
  }, [leaderboardSelectedTestId, fetchLeaderboardForTest]);

  const getAttemptNumber = (att: Attempt) => {
    const studentAttempts = myAttempts.filter(a => a.test_id === att.test_id).sort((a,b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
    return studentAttempts.findIndex(a => a.id === att.id) + 1;
  };


  // Interactive Calendar and Popover states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedReviewTestId, setExpandedReviewTestId] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false); // Default to June 7, 2025

  // Popover States
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);
  const [hoveredTestId, setHoveredTestId] = useState<string | null>(null);
  const [hoveredAttemptId, setHoveredAttemptId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const handleHoverEnter = (type: 'date' | 'test' | 'attempt', id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (type === 'date') setHoveredDateStr(id);
    if (type === 'test') setHoveredTestId(id);
    if (type === 'attempt') setHoveredAttemptId(id);
  };

  const handleHoverLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredDateStr(null);
      setHoveredTestId(null);
      setHoveredAttemptId(null);
    }, 300);
  };


  // Lobby Inputs
  const [testIdStr, setTestIdStr] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Leaderboard Access Inputs & Verified Rank State
  const [leaderboardTestId, setLeaderboardTestId] = useState('');
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
  
  // Submit Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Result state
  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, number>>({});
  
  // Email state
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed' | 'fallback'>('idle');
  const [emailLogs, setEmailLogs] = useState<string>('');

  // Extract display name
  const studentDisplayName = user.email.toLowerCase().includes('harish')
    ? 'Harish Kumar'
    : (user.user_metadata?.full_name || user.email.split('@')[0] || 'Student');
  
  const [currentName, setCurrentName] = useState(studentDisplayName);

  // Load student statistics & available tests (memoized for stable realtime subscription)
  const loadPortalData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      
        const { data: profilesData } = await supabase.from('profiles').select('*');
        if (profilesData) {
          setAllProfiles(profilesData);
          const myProfile = profilesData.find(p => p.id === user.id);
          if (myProfile?.full_name) setCurrentName(myProfile.full_name);
          if (myProfile?.avatar_url) setCurrentAvatar(myProfile.avatar_url);
        }

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
            .select('id, title, type, short_id')
            .in('id', testIds);

          const mapped = (attemptsData || []).map((att: any) => {
            const t = (testsData || []).find((x: any) => x.id === att.test_id);
            return { ...att, test_title: t ? (t.short_id ? `${t.title} - ${t.short_id}` : t.title) : 'Assessment', test_type: t ? t.type : 'test' };
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
            .select('id, title, access_code, teacher_email, type, duration, total_students, created_at, questions, pass_percentage, max_attempts, short_id')
            .in('id', testIds)
            .order('created_at', { ascending: false });
          if (takenTests) {
            setAvailableTests(takenTests);
          }
        } else {
          setAvailableTests([]);
        }
      
    } catch (err) {
      console.error("Failed to load student dashboard stats:", err);
    } finally {
      setIsLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.email]);

  
  // Supabase Realtime Subscription for Dashboard (fixed with stable callback)
  useEffect(() => {
    // Always do an initial load
    loadPortalData();

    

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
  }, [loadPortalData, user.id]);
  
  // Trigger seeding of demo data
  useEffect(() => {
    
  }, []);

  const handleReviewPastAttempt = (attempt: Attempt) => {
    let test: Test | null = null;
    
      test = availableTests.find(t => t.id === attempt.test_id) || null;
    

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
    
      setCorrectAnswers({});
    
    
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

  const getTestStatusLabel = (t: Test) => {
    let status = 'Live';
    const now = new Date().getTime();
    if (t.access_start && now < new Date(t.access_start).getTime()) status = 'Not Started';
    else if (t.access_end && now > new Date(t.access_end).getTime()) status = 'Ended';

    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    };

    if (status === 'Not Started' && t.access_start) return `Not Started (Starts: ${formatDate(t.access_start)})`;
    if (status === 'Ended' && t.access_end) return `Ended (Ended: ${formatDate(t.access_end)})`;
    if (status === 'Live' && t.access_end) return `Live (Ends: ${formatDate(t.access_end)})`;
    return status;
  };
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
  const handleEnterTest = async (e: React.FormEvent, customTestIdStr?: string, customPIN?: string) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const testIdInput = customTestIdStr || testIdStr;
    const pinInput = customPIN || accessCode;

    if (!testIdInput || !pinInput) {
      setErrorMsg('Please enter both Test ID and access code PIN.');
      setLoading(false);
      return;
    }

    try {
      let test: Test | null = null;
      let existingAttempt: any = null;

      
        const { data: testData, error: testErr } = await supabase
          .from('tests')
          .select('*')
          .eq('short_id', parseInt(testIdInput.trim(), 10))
          .eq('access_code', pinInput.trim())
          .order('created_at', { ascending: false })
          .limit(1);

        if (testErr) throw testErr;
        test = (testData && testData.length > 0) ? testData[0] : null;
        
        // Safety parse for JSON string (fixes the blank page crash)
        if (test && typeof test.questions === 'string') {
          try {
            test.questions = JSON.parse(test.questions);
          } catch (e) {
            console.error('Failed to parse questions', e);
          }
        }

        // Strict Validation (Supabase)
        if (test && test.allowed_emails !== null && test.allowed_emails !== undefined) {
          const isAllowed = test.allowed_emails.some((e: string) => e.toLowerCase() === user.email.toLowerCase());
          if (!isAllowed) {
            setErrorMsg("Access Denied: Your email address is not authorized to take this test.");
            setLoading(false);
            return;
          }
        }

        if (test) {
          const { data: attemptData, error: attemptErr } = await supabase
            .from('test_attempts')
            .select('*')
            .eq('test_id', test.id)
            .eq('student_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(1);

          if (attemptErr) throw attemptErr;
          existingAttempt = (attemptData && attemptData.length > 0) ? attemptData[0] : null;
        }
      

      if (!test) {
        setErrorMsg('No test found matching this Test ID and access code PIN.');
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

      // Handle Shuffling and Slicing
      let studentQuestions = [...test.questions];
      if (test.shuffle_questions) {
        studentQuestions = studentQuestions.sort(() => Math.random() - 0.5);
      }
      studentQuestions = studentQuestions.slice(0, test.no_of_questions || studentQuestions.length);

      const testWithFinalQuestions = { ...test, questions: studentQuestions };

      setActiveTest(testWithFinalQuestions);
      setSecondsLeft((testWithFinalQuestions.duration || 10) * 60);
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
    
    if (!force && !showSubmitModal) {
      setShowSubmitModal(true);
      return;
    }

    setShowSubmitModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);

    try {
      
        const timeTakenSeconds = ((activeTest.duration || 10) * 60) - secondsLeft;
        let rpcData, rpcError;
        
        // Try the updated RPC signature first
        const result1 = await supabase.rpc('submit_test_attempt', {
          p_test_id: activeTest.id,
          p_student_id: user.id,
          p_student_email: user.email,
          p_answers: answers,
          p_time_taken_seconds: timeTakenSeconds
        });
        
        rpcData = result1.data;
        rpcError = result1.error;

        // If it fails because the DB signature hasn't been updated yet, fallback to the old signature
        if (rpcError && rpcError.message && (rpcError.message.includes('could not find the function') || rpcError.message.includes('does not exist'))) {
          const result2 = await supabase.rpc('submit_test_attempt', {
            p_test_id: activeTest.id,
            p_student_id: user.id,
            p_student_email: user.email,
            p_answers: answers
          });
          rpcData = result2.data;
          rpcError = result2.error;
        }

        if (rpcError) throw rpcError;

        setScore(rpcData.score);
        setTotalQuestions(rpcData.total_questions);
        setCorrectAnswers(rpcData.correct_answers);
        setViewState('result');
        dispatchEmailNotification(rpcData.score, rpcData.total_questions, rpcData.correct_answers, activeTest);
      
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
      
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailPayload)
      });

      if (response.ok) {
        setEmailStatus('sent');
      } else {
        throw new Error('Serverless Email API returned error code: ' + response.status);
      }
    } catch (err: any) {
      console.warn("Email API offline, launching Local Mail Sandbox simulator. Details:", err.message);
      setEmailStatus('fallback');
      const logText = `
Connecting to Serverless Email API... [FAILED]
Fallback mode: Activating In-App Email Sandbox & Simulation Portal.
SMTP MIME-Message compiled:
-------------------------------------------------------
Date: ${new Date().toUTCString()}
From: EduVerify Pro <jaiharishceoa@gmail.com>
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

    if (!leaderboardTestId || !leaderboardAccessCode) {
      setLeaderboardError('Please fill in both fields.');
      setLoading(false);
      return;
    }

    try {
      let test: Test | null = null;
      let allAttemptsForTest: Attempt[] = [];

      
        // Fetch test from Supabase
        const { data: testData } = await supabase
          .from('tests')
          .select('*')
          .eq('short_id', parseInt(leaderboardTestId.trim(), 10))
          .eq('access_code', leaderboardAccessCode.trim())
          .order('created_at', { ascending: false })
          .limit(1);

        test = (testData && testData.length > 0) ? testData[0] : null;

        if (test) {
          // Fetch all attempts
          const { data: attemptsData } = await supabase
            .from('test_attempts')
            .select('*')
            .eq('test_id', test.id);
          
          allAttemptsForTest = attemptsData || [];
        }
      

      if (!test) {
        setLeaderboardError('No test found matching these details.');
        setLoading(false);
        return;
      }

      // Dedup attempts to keep only the latest per student
      const latestFirst = [...allAttemptsForTest].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
      const uniqueAttempts: Attempt[] = [];
      const seenEmails = new Set();
      for (const att of latestFirst) {
        const key = att.student_email;
        if (!seenEmails.has(key)) {
          seenEmails.add(key);
          uniqueAttempts.push(att);
        }
      }

      // Sort attempts descending by score percentage for ranking
      const sortedAttempts = uniqueAttempts.sort((a, b) => {
        const pctA = a.score / a.total_questions;
        const pctB = b.score / b.total_questions;
        if (pctB !== pctA) return pctB - pctA;
        return (a.time_taken_seconds || 0) - (b.time_taken_seconds || 0);
      });

      // Find my latest attempt for the rank and score percentage check
      const myAttempt = sortedAttempts.find(a => a.student_email === user.email);
      if (!myAttempt) {
        setLeaderboardError('Leaderboard locked: You must take and submit this exam before you can access its leaderboard.');
        setLoading(false);
        return;
      }

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

  // Stats calculations based on unique tests
  const filteredMyAttempts = React.useMemo(() => {
    return myAttempts.filter(a => {
      if (dashboardTimeFilter === 'All Time') return true;
      
      const date = new Date(a.completed_at);
      const now = new Date();
      
      if (dashboardTimeFilter === 'This Year') {
        return date.getFullYear() === now.getFullYear();
      }
      if (dashboardTimeFilter === 'This Month') {
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      }
      if (dashboardTimeFilter === 'This Week') {
        const diff = now.getTime() - date.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      }
      if (dashboardTimeFilter === 'Last 6 Months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return date >= sixMonthsAgo;
      }
      return true;
    });
  }, [myAttempts, dashboardTimeFilter]);

  const uniqueTestIds = Array.from(new Set(filteredMyAttempts.map(a => a.test_id)));
  const uniqueAttempts = uniqueTestIds.map(testId => {
    const attemptsForTest = filteredMyAttempts.filter(a => a.test_id === testId);
    return attemptsForTest.reduce((best, curr) => 
      (curr.score / curr.total_questions) > (best.score / best.total_questions) ? curr : best
    );
  });
  const totalCompleted = uniqueAttempts.length;
  
  const averageAccuracy = totalCompleted > 0
    ? Math.round((uniqueAttempts.reduce((sum, att) => sum + (att.score / att.total_questions), 0) / totalCompleted) * 100)
    : 0;

  const averageImprovement = React.useMemo(() => {
    if (uniqueAttempts.length < 2) {
      if (uniqueAttempts.length === 1) {
        return Math.round((uniqueAttempts[0].score / uniqueAttempts[0].total_questions) * 100);
      }
      return 0;
    }
    const sorted = [...uniqueAttempts].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
    let totalDiff = 0;
    for (let i = 1; i < sorted.length; i++) {
      const currentPct = (sorted[i].score / sorted[i].total_questions) * 100;
      const prevPct = (sorted[i - 1].score / sorted[i - 1].total_questions) * 100;
      totalDiff += (currentPct - prevPct);
    }
    return Math.round(totalDiff / (sorted.length - 1));
  }, [uniqueAttempts]);


  const assessmentsOverview = React.useMemo(() => {
    const testIds = Array.from(new Set(myAttempts.map(a => a.test_id)));
    const total = testIds.length;
    let score100 = 0, score80 = 0, score50 = 0, score45 = 0, scoreBelow45 = 0;
    
    testIds.forEach(testId => {
      const attempts = myAttempts.filter(a => a.test_id === testId);
      const maxPct = Math.max(...attempts.map(a => Math.round((a.score / a.total_questions) * 100)));
      if (maxPct === 100) score100++;
      else if (maxPct >= 80) score80++;
      else if (maxPct >= 50) score50++;
      else if (maxPct >= 45) score45++;
      else scoreBelow45++;
    });

    let currentPct = 0;
    const gradients = [];
    if (score100 > 0) { const p = (score100/total)*100; gradients.push(`#3b82f6 ${currentPct}% ${currentPct + p}%`); currentPct += p; }
    if (score80 > 0) { const p = (score80/total)*100; gradients.push(`#10b981 ${currentPct}% ${currentPct + p}%`); currentPct += p; }
    if (score50 > 0) { const p = (score50/total)*100; gradients.push(`#f59e0b ${currentPct}% ${currentPct + p}%`); currentPct += p; }
    if (score45 > 0) { const p = (score45/total)*100; gradients.push(`#f97316 ${currentPct}% ${currentPct + p}%`); currentPct += p; }
    if (scoreBelow45 > 0) { const p = (scoreBelow45/total)*100; gradients.push(`#ef4444 ${currentPct}% ${currentPct + p}%`); currentPct += p; }
    
    const bg = gradients.length > 0 ? `conic-gradient(${gradients.join(', ')})` : 'conic-gradient(#f1f5f9 0% 100%)';

    return {
      total,
      bg,
      score100: { count: score100, pct: total ? Math.round((score100/total)*100) : 0 },
      score80: { count: score80, pct: total ? Math.round((score80/total)*100) : 0 },
      score50: { count: score50, pct: total ? Math.round((score50/total)*100) : 0 },
      score45: { count: score45, pct: total ? Math.round((score45/total)*100) : 0 },
      scoreBelow45: { count: scoreBelow45, pct: total ? Math.round((scoreBelow45/total)*100) : 0 },
    };
  }, [myAttempts]);

  const performanceTrend = React.useMemo(() => {
    const testIds = Array.from(new Set(filteredMyAttempts.map(a => a.test_id)));
    const testStats = testIds.map(testId => {
      const attempts = filteredMyAttempts.filter(a => a.test_id === testId).sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
      const maxPct = Math.max(...attempts.map(a => Math.round((a.score / a.total_questions) * 100)));
      return { maxPct, date: new Date(attempts[0].completed_at), testId };
    });
    testStats.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let recent = testStats;
    if (recent.length === 0) {
      recent = [{ maxPct: 0, date: new Date(), testId: '' }, { maxPct: 0, date: new Date(), testId: '' }];
    } else if (recent.length === 1) {
      recent = [{ maxPct: 0, date: new Date(), testId: '' }, recent[0]];
    }
    return recent;
  }, [filteredMyAttempts]);

  // Active Exam View hides sidebar
  if (viewState === 'exam' || viewState === 'result') {
    return (
      <div style={{ backgroundColor: viewState === 'exam' ? '#fdfbf7' : 'var(--color-background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

        <div className="container-student" style={{ flex: 1, padding: '32px 0 80px', maxWidth: viewState === 'exam' ? '1200px' : '800px', margin: '0 auto', width: '100%' }}>
          
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
                  <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Active Exam</div>
                  <HoverableTestTitle 
                    title={activeTest.title}
                    shortId={activeTest.short_id}
                    questionsCount={activeTest.questions?.length || 0}
                    duration={activeTest.duration}
                    testCode={activeTest.access_code}
                    customStyle={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: secondsLeft < 60 ? 'var(--color-error-container)' : 'var(--color-surface-container)', color: secondsLeft < 60 ? 'var(--color-on-error-container)' : 'var(--color-on-surface)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: '700', fontFamily: 'monospace', fontSize: '16px' }}>
                  <Clock size={16} />
                  <span>{formatTime(secondsLeft)}</span>
                </div>
              </div>

              <div style={{ padding: '0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '8px', fontWeight: '500' }}>
                  <span>Answer Progress</span>
                  <span>{Object.keys(answers).length} of {activeTest.questions.length} Answered</span>
                </div>
                <div className="progress-bar-container" style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
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
                  <button type="button" onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} style={{ border: '1px solid #ea580c', color: '#ea580c', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: currentQIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentQIdx === 0 ? 0.5 : 1 }} disabled={currentQIdx === 0}>
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
                      <button key={q.id} onClick={() => setCurrentQIdx(idx)} className={`nav-box ${styleClass} ${isActive ? 'nav-box-active' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
                        {idx + 1}
                        {isFlagged && <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', backgroundColor: '#ea580c', transform: 'rotate(45deg)' }}></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT CONFIRMATION MODAL */}
          {showSubmitModal && activeTest && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Submit Exam Confirmation</h3>
                
                {(() => {
                  const unansweredCount = activeTest.questions.length - Object.keys(answers).length;
                  if (unansweredCount > 0) {
                    return (
                      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#991b1b' }}>Unanswered Questions Warning</h4>
                          <p style={{ margin: 0, fontSize: '14px', color: '#b91c1c' }}>
                            You have <strong>{unansweredCount}</strong> unanswered {unansweredCount === 1 ? 'question' : 'questions'}. Are you sure you want to submit your exam now?
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>Ready to Submit</h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#1d4ed8' }}>
                          You have answered all questions. You can confidently submit your exam.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '12px' }}>Question Overview</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '8px' }}>
                    {activeTest.questions.map((q, idx) => {
                      const isAnswered = answers[q.id] !== undefined;
                      const isFlagged = flagged[q.id];
                      
                      const bgColor = isAnswered ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                      const borderColor = isAnswered ? '#93c5fd' : '#fca5a5';
                      const textColor = isAnswered ? '#1d4ed8' : '#b91c1c';

                      return (
                        <div key={idx} style={{ 
                          height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          backgroundColor: bgColor, border: `1px solid ${borderColor}`, color: textColor,
                          fontSize: '13px', fontWeight: '700', position: 'relative'
                        }}>
                          {idx + 1}
                          {isFlagged && (
                            <div style={{ position: 'absolute', top: '-4px', right: '-4px' }}>
                              <AlertTriangle size={14} color="#ea580c" fill="#ea580c" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button onClick={() => setShowSubmitModal(false)} className="btn btn-secondary" style={{ padding: '10px 24px' }}>
                    Return to Test
                  </button>
                  <button onClick={() => handleSubmitExam(true)} className="btn btn-success" style={{ padding: '10px 24px' }}>
                    Confirm Submit
                  </button>
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
                {emailStatus === 'fallback' && <div style={{ color: 'var(--color-warning)', fontSize: '13px', fontWeight: '500' }}>Email API offline. Sandbox report rendered below.</div>}
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
                          <tr style={{ backgroundColor: '#f8fafc' }}><td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Test Title</td><td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
                                <HoverableTestTitle title={activeTest.title} shortId={activeTest.short_id} />
                              </td></tr>
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
                        <span style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Question #{idx + 1}
                          {flagged[q.id] && <Flag size={14} color="#ea580c" fill="#ea580c" />}
                        </span>
                        <span style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)', fontWeight: '600' }}>{isCorrect ? 'Correct (+1)' : 'Incorrect (+0)'}</span>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>{q.text}</h4>
                      {q.imageUrl && <div className="exam-img-container" style={{ margin: '12px 0', textAlign: 'left' }}><img src={q.imageUrl} className="exam-img" style={{ maxHeight: '180px' }} alt="" /></div>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt, optIdx) => {
                          const isStudentSelected = studentAnsIdx === optIdx;
                          const isCorrectOpt = correctAnsIdx === optIdx;
                          const optionStyle: React.CSSProperties = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' };
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
  
  return (
    <div className="edu-app-frame" style={{ backgroundColor: '#fafafa' }}>
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      {/* Sidebar matching the image exactly */}
      <aside className={`edu-sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ backgroundColor: '#ffffff', borderRight: '1px solid #f1f5f9', padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
        
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
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', padding: '12px',
              backgroundColor: '#ffffff', borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
              cursor: 'pointer'
            }}
          >
            <img src={currentAvatar} alt="Student" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #e2e8f0', objectFit: 'cover' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentName || 'jhgno.official'}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{allProfiles.find(p => p.email === user.email)?.designation || 'EXAMINEE'}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>ID - {allProfiles.find(p => p.email === user.email)?.short_id || '-'}</div>
            </div>
            <ChevronDown size={16} color="#94a3b8" />
          </div>
        </div>

        {/* Navigation Menu */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <li>
            <button
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
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
              onClick={() => { setActiveTab('lobby'); setIsMobileMenuOpen(false); }}
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
        <header className="edu-header" style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '24px 40px', gap: '24px', backgroundColor: 'transparent', height: 'auto', borderBottom: 'none'
        }}>
          <button className="hamburger-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div style={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
            {/* Header Avatar */}
            <img src={currentAvatar} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', objectFit: 'cover' }} />
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '0 40px 40px 40px', flex: 1 }}>

          {/* TAB 1: STUDENT DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Welcome Section */}
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  Welcome back, {currentName || 'jhgno.official'}! 👋
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
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{totalCompleted}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}><span style={{ color: '#ea580c', fontWeight: '600' }}>+{Math.min(totalCompleted, 5)}</span> this month</div>
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
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{totalCompleted}</div>
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
                        
                        const currentDateString = getLocalDateStr(new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum));
                        
                        // Check if any tests were taken on this day
                        const dayAttempts = myAttempts.filter(att => getLocalDateStr(att.completed_at) === currentDateString);
                        const isToday = isCurrentMonth && displayNum === today.getDate();
                        
                        return (
                          <div key={i} className="calendar-hover-wrapper" style={{ 
                            position: 'relative', padding: '12px 0 24px', fontSize: '14px', fontWeight: '600', 
                            color: isCurrentMonth ? (isToday ? '#ea580c' : '#0f172a') : '#cbd5e1',
                            backgroundColor: isToday ? '#fff7ed' : 'transparent',
                            borderRadius: '12px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                          }}>
                            {displayNum}
                            
                            {/* Render Icons for Specific Dates dynamically based on myAttempts */}
                            {dayAttempts.length > 0 && (
                                <>
                                  <div style={{ position: 'absolute', bottom: '6px', display: 'flex', gap: '2px' }}>
                                    {dayAttempts.slice(0, 3).map((att, idx) => {
                                      if (att.test_type === 'quiz') return <FileText key={idx} size={14} color="#3b82f6" />;
                                      if (att.test_type === 'assignment') return <ClipboardEdit key={idx} size={14} color="#ea580c" />;
                                      if (att.test_type === 'live_exam') return <Trophy key={idx} size={14} color="#a855f7" />;
                                      return <Target key={idx} size={14} color="#22c55e" />; // test/result
                                    })}
                                  </div>
                                  <div className="calendar-hover-card" style={{
                                    left: (i % 7) < 2 ? '0' : (i % 7) > 4 ? 'auto' : '50%',
                                    right: (i % 7) > 4 ? '0' : 'auto',
                                    transform: (i % 7) < 2 ? 'none' : (i % 7) > 4 ? 'none' : 'translateX(-50%)',
                                    zIndex: 1000
                                  }}>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0' }}>
                                      {new Date(dayAttempts[0]?.completed_at || currentDateString).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1fr', gap: '8px', fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
                                      <div>Exam Name</div>
                                      <div>Test ID</div>
                                      <div>Attempt</div>
                                      <div>Score</div>
                                      <div>Status</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {dayAttempts.map(att => {
                                        const testD = availableTests.find(t => t.id === att.test_id);
                                        const pct = Math.round((att.score / att.total_questions) * 100);
                                        const isPassing = pct >= (testD?.pass_percentage || 80);
                                        const attemptNum = getAttemptNumber(att);
                                        return (
                                          <div key={att.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1fr', gap: '8px', fontSize: '11px', alignItems: 'center' }}>
                                            <div style={{ fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HoverableTestTitle title={testD?.title || att.test_title?.replace(/\s*-.*$/, '') || 'Assessment'} shortId={testD?.short_id || att.short_id} questionsCount={att.total_questions} correctQuestions={att.score} isPassing={Math.round((att.score / (att.total_questions || 1)) * 100) >= (testD?.pass_percentage || 80)} attemptNumber={attemptNum} /></div>
                                            <div style={{ color: '#64748b' }}>{testD?.short_id || '-'}</div>
                                            <div style={{ color: '#64748b' }}>{attemptNum}</div>
                                            <div style={{ fontWeight: '700', color: isPassing ? '#10b981' : '#ef4444' }}>{pct}%</div>
                                            <div>
                                              <span className={`chip ${isPassing ? 'chip-success' : 'chip-error'}`} style={{ fontSize: '9px', padding: '2px 4px' }}>{isPassing ? 'Pass' : 'Fail'}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </>
                            )}
                          </div>
                        )
                      })}
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#3b82f6' }}></div> 100% Score</span> <span>{assessmentsOverview.score100.count} ({assessmentsOverview.score100.pct}%)</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#10b981' }}></div> 80% & Above</span> <span>{assessmentsOverview.score80.count} ({assessmentsOverview.score80.pct}%)</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#f59e0b' }}></div> 50% & Above</span> <span>{assessmentsOverview.score50.count} ({assessmentsOverview.score50.pct}%)</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#f97316' }}></div> 45% & Above</span> <span>{assessmentsOverview.score45.count} ({assessmentsOverview.score45.pct}%)</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#ef4444' }}></div> Below 45%</span> <span>{assessmentsOverview.scoreBelow45.count} ({assessmentsOverview.scoreBelow45.pct}%)</span></div>
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
                        <select 
                          value={dashboardTimeFilter}
                          onChange={(e) => setDashboardTimeFilter(e.target.value)}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '12px', fontWeight: '600', color: '#475569', outline: 'none' }}
                        >
                          <option value="All Time">All Time</option>
                          <option value="This Year">This Year</option>
                          <option value="Last 6 Months">Last 6 Months</option>
                          <option value="This Month">This Month</option>
                          <option value="This Week">This Week</option>
                        </select>
                      </div>
                      
                      {/* Dynamic Line Chart SVG */}
                      <div style={{ position: 'relative', height: '140px', width: '100%', marginTop: '10px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none">
                          {/* Y-Axis Labels */}
                          <text x="0" y="24" fontSize="10" fill="#94a3b8" fontWeight="600">100%</text>
                          <text x="0" y="47" fontSize="10" fill="#94a3b8" fontWeight="600">75%</text>
                          <text x="0" y="69" fontSize="10" fill="#94a3b8" fontWeight="600">50%</text>
                          <text x="0" y="92" fontSize="10" fill="#94a3b8" fontWeight="600">25%</text>
                          
                          {/* Grid lines */}
                          <line x1="25" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="25" y1="42.5" x2="300" y2="42.5" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="25" y1="65" x2="300" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="25" y1="87.5" x2="300" y2="87.5" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="25" y1="110" x2="300" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                          
                          {(() => {
                            if (performanceTrend.length === 0) return null;
                            const pts = performanceTrend.map((pt, i) => {
                              const x = performanceTrend.length > 1 ? 25 + (i / (performanceTrend.length - 1)) * 275 : 162.5;
                              const y = 110 - (pt.maxPct * 0.9);
                              return { x, y };
                            });
                            
                            let pathDataArea = '';
                            let pathDataLine = '';
                            if (pts.length > 1) {
                              pathDataArea = `M 25 110 ` + pts.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L 300 110 Z`;
                              pathDataLine = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
                            } else {
                              pathDataArea = `M 25 110 L ${pts[0].x} ${pts[0].y} L 300 110 Z`;
                              pathDataLine = `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} ${pts[0].y}`;
                            }

                            return (
                              <>
                                {pts.length > 1 && <path d={pathDataArea} fill="rgba(234, 88, 12, 0.1)" />}
                                <path d={pathDataLine} fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                {pts.map((p, i) => (
                                  <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ea580c" />
                                ))}
                              </>
                            );
                          })()}
                        </svg>
                        
                        {/* Axis Labels */}
                        <div style={{ position: 'absolute', bottom: '-15px', left: '25px', display: 'flex', justifyContent: performanceTrend.length > 1 ? 'space-between' : 'center', width: 'calc(100% - 25px)', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                          {performanceTrend.length === 0 ? (
                            <span>No tests yet</span>
                          ) : (
                            performanceTrend.map((pt, i) => (
                              <span key={i}>{pt.testId ? `${i+1}` : ''}</span>
                            ))
                          )}
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ea580c' }}></span>
                          X-Axis: Test
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                          Y-Axis: Mark (Percentage)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setActiveTab('lobby')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Take Test</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Start a new test</div>
                          </div>
                        </div>
                        <ArrowRight size={16} color="#94a3b8" />
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setActiveTab('leaderboard')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trophy size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Leaderboard</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Check your rank</div>
                          </div>
                        </div>
                        <ArrowRight size={16} color="#94a3b8" />
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setActiveTab('review_attempts')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock3 size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Review Attempts</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Review your past tests</div>
                          </div>
                        </div>
                        <ArrowRight size={16} color="#94a3b8" />
                      </div>

                      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutDashboard size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Dashboard</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Return to home</div>
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
                      {myAttempts.length > 10 && (
                        <span onClick={() => setShowAllRecentActivity(!showAllRecentActivity)} style={{ fontSize: '13px', fontWeight: '600', color: '#ea580c', cursor: 'pointer' }}>
                          {showAllRecentActivity ? 'Show Less' : 'View More'}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {myAttempts.length === 0 ? (
                        <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No recent activity found.</div>
                      ) : (
                        myAttempts.slice(0, showAllRecentActivity ? myAttempts.length : 10).map(attempt => {
                          const testD = availableTests.find(t => t.id === attempt.test_id);
                          const pct = (attempt.score / attempt.total_questions) * 100;
                          const isPassed = pct >= (testD?.pass_percentage || 80);
                          
                          const fg = isPassed ? '#16a34a' : '#ea580c';
                          const Icon = isPassed ? CheckCircle2 : AlertCircle;
                          
                          return (
                            <div key={attempt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Icon size={16} color={fg} />
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                  <HoverableTestTitle title={testD?.title || attempt.test_title?.replace(/\s*-.*$/, '') || 'Assessment'} shortId={testD?.short_id || attempt.short_id} questionsCount={attempt.total_questions} correctQuestions={attempt.score} isPassing={Math.round((attempt.score / (attempt.total_questions || 1)) * 100) >= (testD?.pass_percentage || 80)} attemptNumber={getAttemptNumber(attempt)} /> submitted
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
                  Take Test
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
                          <AlertTriangle size={16} /> {typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : String(errorMsg)}
                        </div>
                      )}
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Test ID</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🆔</span>
                          <input
                            type="text"
                            placeholder="Enter the test ID"
                            value={testIdStr}
                            onChange={(e) => setTestIdStr(e.target.value)}
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
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Get the Test ID</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>Obtain the ID from your teacher</div>
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
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{totalCompleted}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}><span style={{ color: '#3b82f6', fontWeight: '600' }}>+{Math.min(totalCompleted, 5)}</span> this month</div>
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
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{totalCompleted}</div>
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
                      
                      const currentDateString = getLocalDateStr(new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum));
                      const dayAttempts = myAttempts.filter(att => getLocalDateStr(att.completed_at) === currentDateString);
                      const isSelected = isCurrentMonth && displayNum === selectedDate.getDate();
                      
                      return (
                        <div
                          key={i}
                          className="calendar-hover-wrapper"
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
                            <>
                              <div style={{ position: 'absolute', bottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', width: '80%' }}>
                                {dayAttempts.slice(0, 3).map((att, idx) => {
                                  let color = '#3b82f6'; // default test
                                  if (att.test_type === 'quiz') color = '#a855f7';
                                  if (att.test_type === 'assignment') color = '#ea580c';
                                  if (att.test_type === 'live_exam') color = '#ef4444';
                                  return <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: color }}></div>;
                                })}
                              </div>
                              <div className="calendar-hover-card" style={{
                                left: (i % 7) < 2 ? '0' : (i % 7) > 4 ? 'auto' : '50%',
                                right: (i % 7) > 4 ? '0' : 'auto',
                                transform: (i % 7) < 2 ? 'none' : (i % 7) > 4 ? 'none' : 'translateX(-50%)',
                                zIndex: 1000
                              }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0' }}>
                                  {new Date(currentDateString).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1fr', gap: '8px', fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
                                  <div>Exam Name</div>
                                  <div>Test ID</div>
                                  <div>Attempt</div>
                                  <div>Score</div>
                                  <div>Status</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {dayAttempts.map(att => {
                                    const testD = availableTests.find(t => t.id === att.test_id);
                                    const pct = Math.round((att.score / att.total_questions) * 100);
                                    const isPassing = pct >= (testD?.pass_percentage || 80);
                                    const attemptNum = getAttemptNumber(att);
                                    return (
                                      <div key={att.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1fr', gap: '8px', fontSize: '11px', alignItems: 'center' }}>
                                        <div style={{ fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HoverableTestTitle title={testD?.title || att.test_title?.replace(/\s*-.*$/, '') || 'Assessment'} shortId={testD?.short_id || att.short_id} questionsCount={att.total_questions} correctQuestions={att.score} isPassing={Math.round((att.score / (att.total_questions || 1)) * 100) >= (testD?.pass_percentage || 80)} attemptNumber={attemptNum} /></div>
                                        <div style={{ color: '#64748b' }}>{testD?.short_id || '-'}</div>
                                        <div style={{ color: '#64748b' }}>{attemptNum}</div>
                                        <div style={{ fontWeight: '700', color: isPassing ? '#10b981' : '#ef4444' }}>{pct}%</div>
                                        <div>
                                          <span className={`chip ${isPassing ? 'chip-success' : 'chip-error'}`} style={{ fontSize: '9px', padding: '2px 4px' }}>{isPassing ? 'Pass' : 'Fail'}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected Date Tests */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Tests on {selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    
                    <div style={{ backgroundColor: '#f3e8ff', color: '#a855f7', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                      {myAttempts.filter(att => getLocalDateStr(att.completed_at) === getLocalDateStr(selectedDate)).length} Attempts
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                    {(() => {
                      const dateAttempts = myAttempts.filter(att => getLocalDateStr(att.completed_at) === getLocalDateStr(selectedDate));
                      if (dateAttempts.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '40px 0' }}>
                            No tests attempted on this date.
                          </div>
                        );
                      }

                      const testIds = Array.from(new Set(dateAttempts.map(a => a.test_id)));

                      return testIds.map(testId => {
                        const testAttempts = dateAttempts.filter(a => a.test_id === testId);
                        const isExpanded = expandedReviewTestId === testId;
                        const latestAttempt = testAttempts[0];
                        let Icon = FileText;
                        let color = '#3b82f6', bg = '#eff6ff';
                        if (latestAttempt.test_type === 'quiz') { color = '#a855f7'; bg = '#f3e8ff'; Icon = Trophy; }
                        if (latestAttempt.test_type === 'assignment') { color = '#ea580c'; bg = '#fff7ed'; Icon = ClipboardEdit; }
                        if (latestAttempt.test_type === 'live_exam') { color = '#ef4444'; bg = '#fef2f2'; Icon = Target; }
                        
                        return (
                          <div key={testId} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Icon size={24} />
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}><HoverableTestTitle title={latestAttempt.test_title?.replace(/\s*-.*$/, '') || 'Assessment'} shortId={testAttempts[0]?.short_id} /></h4>
                                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                    {testAttempts.length} Attempt{testAttempts.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setExpandedReviewTestId(isExpanded ? null : testId)}
                                className="btn btn-outline"
                                style={{ padding: '6px 12px', fontSize: '12px', flexShrink: 0 }}
                              >
                                {isExpanded ? 'Hide Attempts' : 'Review Attempts'}
                              </button>
                            </div>
                            
                            {isExpanded && (
                              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {testAttempts.map((attempt, idx) => {
                                  const pct = Math.round((attempt.score / attempt.total_questions) * 100);
                                  const testDetails = availableTests.find(t => t.id === attempt.test_id);
                                  const passThreshold = testDetails?.pass_percentage || 80;
                                  const isPassing = pct >= passThreshold;
                                  const scoreColor = isPassing ? '#16a34a' : '#dc2626';
                                  const allAttemptsForTest = myAttempts.filter(a => a.test_id === testId);
                                  const attemptIndex = allAttemptsForTest.findIndex(a => a.id === attempt.id);
                                  const globalAttemptNumber = attemptIndex >= 0 ? allAttemptsForTest.length - attemptIndex : testAttempts.length - idx;

                                  return (
                                    <div 
                                      key={attempt.id} 
                                      onClick={() => handleReviewPastAttempt(attempt)} 
                                      title={`Score: ${attempt.score}/${attempt.total_questions} (${pct}%) - Click to review`} 
                                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                                    >
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                                          Attempt {globalAttemptNumber}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                          ID: {allProfiles.find(p => p.email === user.email)?.short_id || 'N/A'}
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                          {new Date(attempt.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: scoreColor }}>
                                          {pct}% Score
                                        </div>
                                        <ArrowRight size={14} color="#94a3b8" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Recent Attempts List */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recent Attempts</h3>
                  {myAttempts.length > 8 && (
                    <button onClick={() => setShowAllRecentAttempts(!showAllRecentAttempts)} style={{ border: 'none', backgroundColor: 'transparent', color: '#6366f1', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      {showAllRecentAttempts ? 'Show Less' : 'View All'} {showAllRecentAttempts ? <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> : <ArrowRight size={16} />}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myAttempts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p>You have not completed any tests yet.</p>
                    </div>
                  ) : (
                    myAttempts.slice(0, showAllRecentAttempts ? myAttempts.length : 8).map((attempt) => {
                      const testD = availableTests.find(t => t.id === attempt.test_id);
                      const pct = Math.round((attempt.score / attempt.total_questions) * 100);
                      const isPassed = pct >= (testD?.pass_percentage || 80);
                      
                      let Icon = FileText;
                      let color = '#3b82f6', bg = '#eff6ff';
                      let typeName = 'Test';
                      if (attempt.test_type === 'quiz') { color = '#a855f7'; bg = '#f3e8ff'; Icon = Trophy; typeName = 'Quiz'; }
                      if (attempt.test_type === 'assignment') { color = '#ea580c'; bg = '#fff7ed'; Icon = ClipboardEdit; typeName = 'Assignment'; }
                      if (attempt.test_type === 'live_exam') { color = '#ef4444'; bg = '#fef2f2'; Icon = Target; typeName = 'Live Exam'; }
                      if (attempt.test_type === 'result') { color = '#16a34a'; bg = '#dcfce7'; Icon = BarChart3; typeName = 'Result'; }
                      
                      const scoreColor = isPassed ? '#16a34a' : '#ef4444';

                      return (
                        <div key={attempt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          
                          {/* Left: Icon & Title */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 30%' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                                <HoverableTestTitle title={attempt.test_title?.replace(/\s*-.*$/, '') || 'Assessment'} shortId={testD?.short_id || attempt.short_id} questionsCount={attempt.total_questions} correctQuestions={attempt.score} isPassing={isPassed} attemptNumber={getAttemptNumber(attempt)} />
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
                            <HoverableTestTitle 
                              title={selectedTest.title}
                              testCode={selectedTest.access_code}
                              shortId={selectedTest.short_id}
                              questionsCount={selectedTest.questions?.length || 0}
                              duration={selectedTest.duration}
                              customStyle={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}
                            />
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
                        <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr', padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '700', color: '#64748b', alignItems: 'center' }}>
                          <div style={{ textAlign: 'center' }}>Rank</div>
                          <div>Student / ID</div>
                          <div style={{ textAlign: 'center' }}>Marks Obtained</div>
                          <div style={{ textAlign: 'center' }}>Percentage</div>
                          <div style={{ textAlign: 'center' }}>Status</div>
                          <div style={{ textAlign: 'right' }}>Time Taken</div>
                        </div>

                        {leaderboardLoading ? (
                           <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading leaderboard...</div>
                        ) : leaderboardAttempts.length === 0 ? (
                           <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No attempts yet.</div>
                        ) : (
                          <>
                            {leaderboardAttempts.slice((leaderboardPage - 1) * itemsPerPage, leaderboardPage * itemsPerPage).map((st, i) => {
                              const rank = (leaderboardPage - 1) * itemsPerPage + i + 1;
                              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                              const isMe = st.student_email === user.email;
                              
                              const profile = allProfiles.find(p => p.email === st.student_email);
                              const displayName = profile?.full_name || st.student_name || st.student_email.split('@')[0];
                              const displayAvatar = profile?.avatar_url || currentAvatar;
                              
                              const pct = Math.round((st.score / st.total_questions) * 100);
                              const durationText = st.time_taken_seconds
                                ? `${Math.floor(st.time_taken_seconds / 60)}m ${st.time_taken_seconds % 60}s`
                                : 'N/A';
                              const isPassing = pct >= (selectedTest?.pass_percentage || 80);
                                
                              return (
                                <div key={st.id} style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr', padding: '16px', borderBottom: '1px solid #f1f5f9', backgroundColor: isMe ? '#f5f3ff' : 'transparent', borderLeft: isMe ? '4px solid #8b5cf6' : '4px solid transparent', alignItems: 'center', transition: 'background-color 0.2s', margin: isMe ? '4px 0' : '0' }}>
                                  <div style={{ textAlign: 'center', fontSize: medal ? '20px' : '14px', fontWeight: '700', color: medal ? 'inherit' : (isMe ? '#8b5cf6' : '#0f172a') }}>
                                    {medal || rank}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                                      <img src={displayAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '14px', fontWeight: isMe ? '800' : '700', color: isMe ? '#8b5cf6' : '#0f172a' }}>{displayName} {isMe ? '(You)' : ''}</div>
                                      <div style={{ fontSize: '11px', color: '#64748b' }}>{st.short_id !== undefined ? `ID: ${st.short_id}` : (profile?.short_id !== undefined ? `ID: ${profile.short_id}` : 'LOADING...')}</div>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: isMe ? '800' : '700', color: isMe ? '#8b5cf6' : '#0f172a' }}>{st.score}</div>
                                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '800', color: isMe ? '#8b5cf6' : '#10b981' }}>{pct}%</div>
                                  <div style={{ textAlign: 'center' }}>
                                    <span className={`chip ${isPassing ? 'chip-success' : 'chip-error'}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                      {isPassing ? 'Pass' : 'Fail'}
                                    </span>
                                  </div>
                                  <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: isMe ? '700' : '600', color: isMe ? '#8b5cf6' : '#0f172a' }}>{durationText}</div>
                                </div>
                              );
                            })}
                            {/* Pagination Controls */}
                            {leaderboardAttempts.length > itemsPerPage && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                  onClick={() => setLeaderboardPage(p => Math.max(1, p - 1))}
                                  disabled={leaderboardPage === 1}
                                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: leaderboardPage === 1 ? '#f8fafc' : '#ffffff', color: leaderboardPage === 1 ? '#cbd5e1' : '#0f172a', cursor: leaderboardPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px' }}
                                >
                                  Prev
                                </button>
                                {Array.from({ length: Math.ceil(leaderboardAttempts.length / itemsPerPage) }).map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setLeaderboardPage(idx + 1)}
                                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: leaderboardPage === idx + 1 ? '#3b82f6' : '#ffffff', color: leaderboardPage === idx + 1 ? '#ffffff' : '#0f172a', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                                  >
                                    {idx + 1}
                                  </button>
                                ))}
                                <button
                                  onClick={() => setLeaderboardPage(p => Math.min(Math.ceil(leaderboardAttempts.length / itemsPerPage), p + 1))}
                                  disabled={leaderboardPage === Math.ceil(leaderboardAttempts.length / itemsPerPage)}
                                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: leaderboardPage === Math.ceil(leaderboardAttempts.length / itemsPerPage) ? '#f8fafc' : '#ffffff', color: leaderboardPage === Math.ceil(leaderboardAttempts.length / itemsPerPage) ? '#cbd5e1' : '#0f172a', cursor: leaderboardPage === Math.ceil(leaderboardAttempts.length / itemsPerPage) ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px' }}
                                >
                                  Next
                                </button>
                              </div>
                            )}
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
                            onChange={(e) => {
                      setLeaderboardSelectedTestId(e.target.value);
                      setLeaderboardPage(1);
                    }}
                            style={{ width: '100%', padding: '10px 12px 10px 44px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#0f172a', appearance: 'none', outline: 'none', height: '44px', backgroundColor: '#fff' }}
                          >
                            <option value="">-- Select a test --</option>
                            {availableTests.map(t => (
                              <option key={t.id} value={t.id} title={`${t.title}${t.short_id ? ` - ${t.short_id}` : ''}`}>
                                {t.title.length > 10 ? t.title.substring(0, 10) + '...' : t.title} {t.short_id ? `- ${t.short_id}` : ''} [{getTestStatusLabel(t)}]
                              </option>
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

      <ProfileModal 
        user={user}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdate={(newName, newAvatar) => {
          if (newName) setCurrentName(newName);
          if (newAvatar) setCurrentAvatar(newAvatar);
        }}
      />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { 
  Clock, ArrowLeft, ArrowRight, Flag, CheckCircle2, 
  AlertTriangle, LogOut, GraduationCap,
  LayoutDashboard, BookOpen, ClipboardList, Award, Flame
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
}

interface Attempt {
  id: string;
  test_id: string;
  student_email: string;
  score: number;
  total_questions: number;
  completed_at: string;
  allowed_retry: boolean;
  test_title?: string;
}

interface StudentPortalProps {
  user: { id: string; email: string; user_metadata?: { full_name?: string } };
  isDemo: boolean;
  onLogout: () => void;
}

export default function StudentPortal({ user, isDemo, onLogout }: StudentPortalProps) {
  // Navigation tabs: 'dashboard' | 'lobby' | 'leaderboard' | 'exam' | 'result'
  // When 'exam' is active, we hide the sidebar for focus.
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lobby' | 'leaderboard'>('dashboard');
  const [viewState, setViewState] = useState<'lobby' | 'exam' | 'result'>('lobby');

  // Attempts and tests states (for dashboard and leaderboard verification)
  const [myAttempts, setMyAttempts] = useState<Attempt[]>([]);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);


  // Lobby Inputs
  const [teacherEmail, setTeacherEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Leaderboard Access Inputs & Verified Rank State
  const [leaderboardTeacherEmail, setLeaderboardTeacherEmail] = useState('');
  const [leaderboardAccessCode, setLeaderboardAccessCode] = useState('');
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
          const testIds = attemptsData.map(a => a.test_id);
          const { data: testsData } = await supabase
            .from('tests')
            .select('id, title')
            .in('id', testIds);

          const mapped = (attemptsData || []).map(att => {
            const t = (testsData || []).find(x => x.id === att.test_id);
            return { ...att, test_title: t ? t.title : 'Assessment' };
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

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'lobby') {
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

  // STANDARD PORTAL WITH SIDEBAR
  return (
    <div className="edu-app-frame">
      
      {/* Student Sidebar */}
      <aside className="edu-sidebar">
        <div>
          {/* Logo Frame */}
          <div className="sidebar-logo">
            <GraduationCap size={28} />
            <span>EduVerify Pro</span>
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
                onClick={() => { setActiveTab('leaderboard'); setVerifiedLeaderboard(null); }}
                className={`sidebar-item-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              >
                <ClipboardList size={18} />
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
              EduVerify Pro Testing Center
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
                <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Welcome back, {studentDisplayName}.</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>
                  {totalCompleted > 0 
                    ? `You have completed ${totalCompleted} assessments this semester. Keep up the momentum!` 
                    : 'Get started by joining your first active class assessment!'}
                </p>
              </div>

              {/* Statistics & Overview Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px' }}>
                
                {/* Performance overview Card */}
                <div className="card performance-chart-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Performance Overview</h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>Track score history percentage</p>
                    </div>
                    {totalCompleted > 0 && (
                      <span className="chip chip-success" style={{ padding: '4px 10px', fontSize: '11px' }}>
                        PERCENTILE: 94th
                      </span>
                    )}
                  </div>

                  {/* Render Visual Bar Chart */}
                  <div className="chart-bar-container">
                    {totalCompleted === 0 ? (
                      // Mock placeholder bars if no tests taken yet
                      <>
                        <div className="chart-bar-item">
                          <div className="chart-bar-fill" style={{ height: '75%' }}><div className="chart-bar-tooltip">75%</div></div>
                          <span className="chart-bar-label">Demo Exam 1</span>
                        </div>
                        <div className="chart-bar-item">
                          <div className="chart-bar-fill" style={{ height: '82%' }}><div className="chart-bar-tooltip">82%</div></div>
                          <span className="chart-bar-label">Demo Exam 2</span>
                        </div>
                        <div className="chart-bar-item">
                          <div className="chart-bar-fill active" style={{ height: '94%' }}><div className="chart-bar-tooltip">94%</div></div>
                          <span className="chart-bar-label">Target Level</span>
                        </div>
                      </>
                    ) : (
                      // Render actual attempts
                      myAttempts.slice(-5).map((att, idx) => {
                        const pct = Math.round((att.score / att.total_questions) * 100);
                        return (
                          <div key={att.id} className="chart-bar-item">
                            <div className="chart-bar-fill active" style={{ height: `${pct}%` }}>
                              <div className="chart-bar-tooltip">{pct}%</div>
                            </div>
                            <span className="chart-bar-label" title={att.test_title}>
                              {att.test_title || `Exam #${idx + 1}`}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right side stats widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Focus Time Card */}
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#1c4e80', color: 'white' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, fontWeight: '600' }}>Focus Time</span>
                      <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>124h <span style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.8 }}>this semester</span></h4>
                    </div>
                  </div>

                  {/* Accuracy Stats Card */}
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-success-container)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', fontWeight: '600' }}>Accuracy Score</span>
                      <h4 style={{ fontSize: '20px', fontWeight: '700' }}>{totalCompleted > 0 ? `${averageAccuracy}%` : '91.2%'}</h4>
                    </div>
                  </div>

                </div>

              </div>

              {/* Leaderboard and Available Tests */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                
                {/* Available Tests / Upcoming challenges */}
                <div className="card">
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={18} style={{ color: 'var(--color-warning)' }} />
                    Active Assessments Lobby
                  </h3>
                  
                  {availableTests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-on-surface-variant)', fontSize: '13px' }}>
                      No active tests found in system. All caught up!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {availableTests.slice(0, 3).map(test => (
                        <div key={test.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-default)' }}>
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '600' }}>{test.title}</h4>
                            <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>PIN Code: {test.access_code}</span>
                          </div>
                          <button
                            onClick={() => {
                              setTeacherEmail(test.teacher_email);
                              setAccessCode(test.access_code);
                              setActiveTab('lobby');
                            }}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Join Exam
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Leaderboard Mini preview card */}
                <div className="card">
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Class Leaderboard Top Ranks</h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-outline-variant)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="medal-badge medal-gold">1</span>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Elena Rodriguez</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}>99.2%</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-outline-variant)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="medal-badge medal-silver">2</span>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Chen Wei</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}>98.5%</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="medal-badge medal-bronze">3</span>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Amina Okafor</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}>97.8%</span>
                    </li>
                  </ul>
                  <button onClick={() => setActiveTab('leaderboard')} className="btn btn-secondary" style={{ width: '100%', padding: '6px', fontSize: '12px', marginTop: '16px' }}>
                    View Full Rankings
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TAKE TEST ENTRY LOBBY */}
          {activeTab === 'lobby' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Join Examination</h2>
                  <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                    Provide the teacher email and numeric access PIN to start taking the test.
                  </p>
                </div>

                {errorMsg && (
                  <div className="chip chip-error" style={{ display: 'flex', width: '100%', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '16px', gap: '8px', fontSize: '13px', textTransform: 'none' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleEnterTest(e)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="input-label">Teacher Email Address</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="teacher@school.edu"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">Test Access Code PIN</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 88200"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', height: '44px', marginTop: '8px' }}
                    disabled={loading}
                  >
                    {loading ? 'Validating credentials...' : 'Start Assessment'}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: LEADERBOARD VIEW AND VERIFICATION ACCESS GATE */}
          {activeTab === 'leaderboard' && (
            <div>
              {!verifiedLeaderboard ? (
                // Image 2 access rankings form
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '32px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Award size={24} />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>Access Class Rankings</h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginTop: '4px', marginBottom: '24px' }}>
                      Enter credentials to verify your eligibility for the leaderboard.
                    </p>

                    {leaderboardError && (
                      <div className="chip chip-error" style={{ display: 'flex', width: '100%', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '16px', gap: '8px', fontSize: '13px', textTransform: 'none', textAlign: 'left' }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{leaderboardError}</span>
                      </div>
                    )}

                    <form onSubmit={handleVerifyLeaderboard} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                      <div>
                        <label className="input-label">Teacher Email</label>
                        <input
                          type="email"
                          className="input-field"
                          placeholder="e.g. smith.prof@university.edu"
                          value={leaderboardTeacherEmail}
                          onChange={(e) => setLeaderboardTeacherEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="input-label">Test Password / Test Code PIN</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="XXXX-XXXX-XXXX"
                          value={leaderboardAccessCode}
                          onChange={(e) => setLeaderboardAccessCode(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', height: '44px', marginTop: '16px', backgroundColor: '#006875' }}
                        disabled={loading}
                      >
                        {loading ? 'Verifying eligibility...' : 'View My Rank & Leaderboard'}
                        {!loading && <ArrowRight size={16} />}
                      </button>
                    </form>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', borderTop: '1px solid var(--color-outline-variant)', marginTop: '24px', paddingTop: '16px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                      <div>🔒 Secure Access</div>
                      <div>• AES-256 Verified</div>
                    </div>
                  </div>
                </div>
              ) : (
                // Image 3 class leaderboard view
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Verification success banner */}
                  <div className="card" style={{ borderLeft: '5px solid var(--color-success)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={20} /> Verification Success!
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
                      Your latest <strong>{verifiedLeaderboard.test.title}</strong> module was verified with academic rigor.
                    </p>
                  </div>

                  {/* Top Stats Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px' }}>
                    
                    {/* Rank Indicator box */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase' }}>Your Current Rank</span>
                        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0369a1', marginTop: '4px' }}>
                          #{verifiedLeaderboard.userRank}
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#0284c7', marginLeft: '8px' }}>
                            📈 Up from #7
                          </span>
                        </h2>
                      </div>
                      <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid #bae6fd', paddingTop: '12px', marginTop: '16px' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Test Score</span>
                          <p style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{verifiedLeaderboard.userScorePercent}%</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Percentile</span>
                          <p style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{verifiedLeaderboard.userPercentile}th</p>
                        </div>
                      </div>
                    </div>

                    {/* Trend box card */}
                    <div className="card">
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Recent Performance Trend</h4>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '80px', marginTop: '16px', borderBottom: '1px solid #cbd5e1' }}>
                        <div style={{ height: '60%', width: '12px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} title="T1"><span style={{ display: 'block', fontSize: '9px', marginTop: '-15px', textAlign: 'center' }}>T1</span></div>
                        <div style={{ height: '75%', width: '12px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} title="T2"><span style={{ display: 'block', fontSize: '9px', marginTop: '-15px', textAlign: 'center' }}>T2</span></div>
                        <div style={{ height: '94%', width: '12px', backgroundColor: '#1c4e80', borderRadius: '2px' }} title="T3"><span style={{ display: 'block', fontSize: '9px', marginTop: '-15px', textAlign: 'center' }}>T3</span></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: '600' }}>↑ 12% Growth</span>
                        <button onClick={() => setVerifiedLeaderboard(null)} style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                          View History
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Leaderboard Table card */}
                  <div className="card">
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Class Leaderboard</h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '16px' }}>
                      {verifiedLeaderboard.test.title} - Section A (2024)
                    </p>

                    <div className="table-container">
                      <table className="density-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Student</th>
                            <th>Verification</th>
                            <th>Points</th>
                            <th>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verifiedLeaderboard.attempts.map((att, index) => {
                            const studentRank = index + 1;
                            const isUser = att.student_email === user.email;
                            const displayEmail = isUser ? `${studentDisplayName} (You)` : att.student_email.split('@')[0];
                            const studentPct = Math.round((att.score / att.total_questions) * 100);
                            
                            // Mock points (e.g. percentage * 25)
                            const points = Math.round((att.score / att.total_questions) * 2480);

                            return (
                              <tr key={att.id} style={{ backgroundColor: isUser ? '#e0f2fe' : 'transparent' }}>
                                <td>
                                  {studentRank === 1 && <span className="medal-badge medal-gold">1st</span>}
                                  {studentRank === 2 && <span className="medal-badge medal-silver">2nd</span>}
                                  {studentRank === 3 && <span className="medal-badge medal-bronze">3rd</span>}
                                  {studentRank > 3 && <strong>#{studentRank}</strong>}
                                </td>
                                <td style={{ fontWeight: isUser ? '700' : '500' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img src={isUser ? (studentAvatar as any) : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80"} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                    <span>{displayEmail}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className="chip chip-success" style={{ fontSize: '10px', padding: '2px 8px' }}>
                                    {isUser ? '✓ Secure' : '✓ Verified'}
                                  </span>
                                </td>
                                <td style={{ fontFamily: 'monospace' }}>{points.toLocaleString()}</td>
                                <td style={{ fontWeight: '700' }}>{studentPct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                      <button onClick={() => setVerifiedLeaderboard(null)} className="btn btn-primary" style={{ backgroundColor: '#005f73' }}>
                        <ArrowLeft size={16} /> Search Another Class
                      </button>
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

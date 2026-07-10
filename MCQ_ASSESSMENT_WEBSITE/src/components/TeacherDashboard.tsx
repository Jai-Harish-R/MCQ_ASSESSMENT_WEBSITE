import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { 
  LayoutDashboard, PlusCircle, LogOut, 
  Trash2, Users, Award, AlertCircle, BookOpen, 
  Check, Send, GraduationCap, RefreshCw,
  Upload, Download, Image, ClipboardList,
  Trophy, ClipboardEdit, ChevronDown, BarChart3, ShieldCheck
} from 'lucide-react';
import animeAvatar from '../assets/anime_avatar.png';

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
  access_start?: string | null;
  access_end?: string | null;
  allowed_emails?: string[] | null;
  created_at: string;
}

interface Attempt {
  id: string;
  test_id: string;
  student_email: string;
  student_name?: string;
  score: number;
  total_questions: number;
  completed_at: string;
  allowed_retry: boolean;
  test_title?: string;
  time_taken_seconds?: number;
  profiles?: {
    full_name: string;
  } | null;
}

interface TeacherDashboardProps {
  user: { id: string; email: string; user_metadata?: { full_name?: string; profession?: string } };
  isDemo: boolean;
  onLogout: () => void;
}

export default function TeacherDashboard({ user, isDemo, onLogout }: TeacherDashboardProps) {
  // Navigation tabs: 'dashboard' | 'exams' | 'students' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exams' | 'students' | 'leaderboard'>('exams');
  
  // Data states
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected test ID for the Leaderboard tab
  const [selectedLeaderboardTestId, setSelectedLeaderboardTestId] = useState<string>('');
  const [leaderboardAttempts, setLeaderboardAttempts] = useState<Attempt[]>([]);

  // Test form state
  const [testTitle, setTestTitle] = useState('');
  const [targetYear, setTargetYear] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const profession = user.user_metadata?.profession;
  const [accessCode, setAccessCode] = useState('');
  const [duration, setDuration] = useState(10);
  const [totalStudents, setTotalStudents] = useState(50);
  const [accessStart, setAccessStart] = useState('');
  const [accessEnd, setAccessEnd] = useState('');
  const [allowedEmailsInput, setAllowedEmailsInput] = useState('');
  const [strictValidation, setStrictValidation] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        // Simple regex to find emails in the text
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
        const matches = text.match(emailRegex) || [];
        // Deduplicate and append to existing input
        const currentEmails = allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e);
        const uniqueNew = [...new Set(matches)].filter(m => !currentEmails.includes(m));
        
        if (uniqueNew.length > 0) {
          const combined = [...currentEmails, ...uniqueNew].join(', ');
          setAllowedEmailsInput(combined);
          alert(`Successfully imported ${uniqueNew.length} new email(s).`);
        } else {
          alert('No new valid emails found in the file.');
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };
  const [questions, setQuestions] = useState<Array<{
    text: string;
    options: string[];
    correctIndex: number;
    imageUrl?: string;
  }>>([
    { text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }
  ]);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract display name
  const teacherDisplayName = user.email.toLowerCase().includes('jai') 
    ? 'Jai' 
    : (user.user_metadata?.full_name || user.email.split('@')[0]);

  // Load stats and tables
  const loadData = async () => {
    setLoading(true);
    setMsg(null);
    try {
      if (isDemo) {
        const localTests = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        const filteredTests = localTests.filter((t: any) => t.teacher_email === user.email);
        setTests(filteredTests);

        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        const mappedAttempts = localAttempts.map((att: any) => {
          const t = localTests.find((x: any) => x.id === att.test_id);
          return { ...att, test_title: t ? t.title : 'Deleted Test' };
        }).filter((att: any) => {
          const t = localTests.find((x: any) => x.id === att.test_id);
          return t && t.teacher_email === user.email;
        });
        setAttempts(mappedAttempts);
      } else {
        const { data: testsData, error: testsErr } = await supabase
          .from('tests')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        if (testsErr) throw testsErr;
        setTests(testsData || []);

        if (testsData && testsData.length > 0) {
          const testIds = testsData.map(t => t.id);
          const { data: attemptsData, error: attemptsErr } = await supabase
            .from('test_attempts')
            .select('*')
            .in('test_id', testIds)
            .order('completed_at', { ascending: false });

          if (attemptsErr) throw attemptsErr;

          const mappedAttempts = (attemptsData || []).map(att => {
            const t = testsData.find(x => x.id === att.test_id);
            return { ...att, test_title: t ? t.title : 'Unknown Test' };
          });
          setAttempts(mappedAttempts);
        } else {
          setAttempts([]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: err.message || 'Failed to sync database data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id, isDemo]);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (isDemo) return;

    const channel = supabase
      .channel(`teacher-realtime-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test_attempts' },
        (payload) => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tests' },
        (payload) => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, isDemo]);

  // Load leaderboard details when a test is selected in the tab
  useEffect(() => {
    if (selectedLeaderboardTestId) {
      const allForTest = attempts.filter(att => att.test_id === selectedLeaderboardTestId);
      // Sort descending by score percentage
      const sorted = [...allForTest].sort((a, b) => {
        const pctA = a.score / a.total_questions;
        const pctB = b.score / b.total_questions;
        return pctB - pctA;
      });
      setLeaderboardAttempts(sorted);
    } else {
      setLeaderboardAttempts([]);
    }
  }, [selectedLeaderboardTestId, attempts]);

  // Form question managers
  const addQuestionField = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);
  };

  const removeQuestionField = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  const updateCorrectAnswer = (qIndex: number, correctIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = correctIndex;
    setQuestions(updated);
  };

  const updateImageUrl = (qIndex: number, url: string) => {
    const updated = [...questions];
    updated[qIndex].imageUrl = url;
    setQuestions(updated);
  };

  const handleImageUpload = (qIndex: number, file: File | null) => {
    if (!file) return;
    if (file.size > 512 * 1024) {
      alert("Image file is too large. Please select an image smaller than 512KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Str = e.target?.result as string;
      const updated = [...questions];
      updated[qIndex].imageUrl = base64Str;
      setQuestions(updated);
    };
    reader.readAsDataURL(file);
  };

  const removeQuestionImage = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].imageUrl = '';
    setQuestions(updated);
  };

  // CSV template utility
  const downloadCSVTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Question,Option A,Option B,Option C,Option D,Correct Answer (1-4),Image URL\n"
      + "\"What is the capital of France?\",\"London\",\"Paris\",\"Berlin\",\"Rome\",2,\"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400\"\n"
      + "\"Which planet is known as the Red Planet?\",\"Venus\",\"Mars\",\"Jupiter\",\"Saturn\",2,\"\"\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "eduverify_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk parser processor
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg(null);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        let imported: Array<{ text: string; options: string[]; correctIndex: number; imageUrl?: string }> = [];

        if (fileExtension === 'json') {
          const data = JSON.parse(text);
          if (!Array.isArray(data)) {
            throw new Error("JSON file must contain an array of question objects.");
          }
          imported = data.map((q: any, idx: number) => {
            if (!q.text || !Array.isArray(q.options) || q.options.length !== 4) {
              throw new Error(`Invalid format in question #${idx + 1}.`);
            }
            return {
              text: q.text,
              options: q.options.map((opt: any) => String(opt)),
              correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3 ? q.correctIndex : 0,
              imageUrl: q.imageUrl || ''
            };
          });
        } else if (fileExtension === 'csv') {
          const lines = text.split('\n');
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
            if (matches.length >= 6) {
              const textStr = matches[0].replace(/^"|"$/g, '').trim();
              const options = [
                matches[1].replace(/^"|"$/g, '').trim(),
                matches[2].replace(/^"|"$/g, '').trim(),
                matches[3].replace(/^"|"$/g, '').trim(),
                matches[4].replace(/^"|"$/g, '').trim()
              ];
              let correctIndex = parseInt(matches[5].replace(/^"|"$/g, '').trim()) - 1;
              if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
                correctIndex = 0;
              }
              const imageUrl = matches[6] ? matches[6].replace(/^"|"$/g, '').trim() : '';
              imported.push({ text: textStr, options, correctIndex, imageUrl });
            }
          }
        } else {
          throw new Error("Unsupported file format.");
        }

        if (imported.length === 0) {
          throw new Error("No questions found.");
        }

        setQuestions(imported);
        setMsg({ type: 'success', text: `Loaded ${imported.length} questions from ${file.name}!` });
      } catch (err: any) {
        setMsg({ type: 'error', text: err.message || 'Error parsing imported file.' });
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // Submit test creation
  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!testTitle.trim()) {
      setMsg({ type: 'error', text: 'Test title is required.' });
      return;
    }
    if (!/^\d{6}$/.test(accessCode.trim())) {
      setMsg({ type: 'error', text: 'Access code PIN must be exactly a 6-digit number (e.g. 123456).' });
      return;
    }

    if (!accessStart || !accessEnd) {
      setMsg({ type: 'error', text: 'Both Access Start Time and Access End Time must be provided before publishing.' });
      return;
    }

    if (new Date(accessStart) >= new Date(accessEnd)) {
      setMsg({ type: 'error', text: 'Access End Time must be after Access Start Time.' });
      return;
    }

    if (questions.length === 0) {
      setMsg({ type: 'error', text: 'You must add at least one question to the test.' });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setMsg({ type: 'error', text: `Question ${i + 1} text cannot be empty.` });
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j].trim()) {
          setMsg({ type: 'error', text: `Option ${j + 1} for Question ${i + 1} cannot be empty.` });
          return;
        }
      }
    }

    setLoading(true);

    try {
      const testId = isDemo ? 'test-' + Date.now() : undefined;
      const formattedQuestions: Question[] = questions.map((q, idx) => ({
        id: `q-${idx + 1}`,
        text: q.text,
        options: q.options,
        imageUrl: q.imageUrl || ''
      }));

      const correctAnswersObj = questions.reduce((acc, q, idx) => {
        acc[`q-${idx + 1}`] = q.correctIndex;
        return acc;
      }, {} as Record<string, number>);

      if (isDemo) {
        const newTest: Test = {
          id: testId!,
          title: testTitle,
          access_code: accessCode,
          duration: duration,
          total_students: totalStudents,
          teacher_email: user.email,
          questions: formattedQuestions,
          created_at: new Date().toISOString(),
          access_start: accessStart ? new Date(accessStart).toISOString() : null,
          access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
          allowed_emails: strictValidation ? (allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : []) : null
        };

        const localTests = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        localTests.push(newTest);
        localStorage.setItem('demo_tests', JSON.stringify(localTests));

        const localAnswers = JSON.parse(localStorage.getItem('demo_answers') || '{}');
        localAnswers[testId!] = correctAnswersObj;
        localStorage.setItem('demo_answers', JSON.stringify(localAnswers));

        setMsg({ type: 'success', text: `Test "${testTitle}" created successfully in Demo Mode! Access code: ${accessCode}` });
        
        setTestTitle('');
        setAccessCode('');
        setTargetYear('');
        setTargetClass('');
        setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);
        loadData();
      } else {
        const { data: testData, error: testErr } = await supabase
          .from('tests')
          .insert({
            teacher_id: user.id,
            teacher_email: user.email,
            title: testTitle,
            access_code: accessCode,
            questions: formattedQuestions,
            type: 'test',
            duration: duration,
            total_students: totalStudents,
            access_start: accessStart ? new Date(accessStart).toISOString() : null,
            access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
            allowed_emails: strictValidation ? (allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : []) : null
          })
          .select()
          .single();

        if (testErr) throw testErr;

        const { error: answersErr } = await supabase
          .from('test_answers')
          .insert({
            test_id: testData.id,
            correct_answers: correctAnswersObj
          });

        if (answersErr) throw answersErr;

        setMsg({ type: 'success', text: `Test "${testTitle}" published successfully! Access Code PIN: ${accessCode}` });
        
        setTestTitle('');
        setAccessCode('');
        setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);
        loadData();
      }
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: err.message || 'Failed to publish test.' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle Retry
  const handleToggleRetry = async (attemptId: string, currentStatus: boolean) => {
    setSyncing(true);
    try {
      if (isDemo) {
        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        const updated = localAttempts.map((att: any) => {
          if (att.id === attemptId) {
            return { ...att, allowed_retry: !currentStatus };
          }
          return att;
        });
        localStorage.setItem('demo_attempts', JSON.stringify(updated));
        setAttempts(attempts.map(att => att.id === attemptId ? { ...att, allowed_retry: !currentStatus } : att));
      } else {
        const { error } = await supabase
          .from('test_attempts')
          .update({ allowed_retry: !currentStatus })
          .eq('id', attemptId);

        if (error) throw error;
        setAttempts(attempts.map(att => att.id === attemptId ? { ...att, allowed_retry: !currentStatus } : att));
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to toggle retry permission.');
    } finally {
      setSyncing(false);
    }
  };

  // Delete Test
  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? All student results will be deleted.')) return;
    setLoading(true);
    try {
      if (isDemo) {
        const localTests = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        const updatedTests = localTests.filter((t: any) => t.id !== testId);
        localStorage.setItem('demo_tests', JSON.stringify(updatedTests));

        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        const updatedAttempts = localAttempts.filter((a: any) => a.test_id !== testId);
        localStorage.setItem('demo_attempts', JSON.stringify(updatedAttempts));

        loadData();
      } else {
        const { error } = await supabase
          .from('tests')
          .delete()
          .eq('id', testId);

        if (error) throw error;
        loadData();
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete test.');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalTests = tests.length;
  const totalAttempts = attempts.length;
  const classAvg = totalAttempts > 0 
    ? Math.round((attempts.reduce((sum, att) => sum + (att.score / att.total_questions), 0) / totalAttempts) * 100)
    : 0;

  return (
    <div className="edu-app-frame">
      
      {/* Teacher Sidebar Navigation */}
      <aside className="edu-sidebar">
        <div>
          {/* Logo Frame */}
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
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

          {/* Profile Card */}
          <div className="sidebar-profile">
            <img className="sidebar-profile-avatar" src={animeAvatar as any} alt="Teacher Avatar" />
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{teacherDisplayName}</span>
              <span className="sidebar-profile-role">Educator Portal</span>
            </div>
          </div>

          {/* Sidebar Menu list */}
          <ul className="sidebar-menu">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`sidebar-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                Dashboard Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('exams')}
                className={`sidebar-item-btn ${activeTab === 'exams' ? 'active' : ''}`}
              >
                <BookOpen size={18} />
                Conduct Test (Create)
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('students')}
                className={`sidebar-item-btn ${activeTab === 'students' ? 'active' : ''}`}
              >
                <ClipboardList size={18} />
                Student Results
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('leaderboard');
                  if (tests.length > 0 && !selectedLeaderboardTestId) {
                    setSelectedLeaderboardTestId(tests[0].id);
                  }
                }}
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

      {/* Main Workspace Frame */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        
        {/* Simple Top Bar */}
        <header className="edu-header">
          <div className="header-title-row">
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.02em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            </span>
          </div>
          <div className="header-actions">
            <button onClick={loadData} className="header-icon-btn" title="Sync database data">
              <RefreshCwShim size={16} spinning={loading} />
            </button>
            <img className="header-avatar" src={animeAvatar as any} alt="Teacher Avatar" />
          </div>
        </header>

        {/* Content Workspace container (1-column clean layout) */}
        <div className="workspace-container">

          {/* Notifications banner */}
          {msg && (
            <div className="card" style={{
              backgroundColor: msg.type === 'success' ? 'var(--color-success-container)' : 'var(--color-error-container)',
              color: msg.type === 'success' ? 'var(--color-on-success-container)' : 'var(--color-on-error-container)',
              borderColor: msg.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px'
            }}>
              {msg.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              <span>{typeof msg.text === 'object' ? JSON.stringify(msg.text) : String(msg.text)}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header Title */}
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Teacher Dashboard</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '4px' }}>
                  Overview of active assessments and student outcomes.
                </p>
              </div>

              {/* Stats overview boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Active Tests</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{totalTests}</h3>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Submissions</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{totalAttempts}</h3>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-success-container)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Class Average</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{classAvg}%</h3>
                  </div>
                </div>
              </div>

              {/* Assessments list */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Assessments Conducted</h3>
                {tests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-on-surface-variant)' }}>
                    No assessments conducted yet. Click "Conduct Test" to draft your first quiz.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tests.map(test => (
                      <div key={test.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-default)' }}>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{test.title}</h4>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                            <span>PIN Code: <strong style={{ color: 'var(--color-primary)' }}>{test.access_code}</strong></span>
                            <span>Questions: <strong>{test.questions ? test.questions.length : 0}</strong></span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => {
                              setSelectedLeaderboardTestId(test.id);
                              setActiveTab('leaderboard');
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            View Leaderboard
                          </button>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className="btn btn-error"
                            style={{ padding: '6px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONDUCT TEST (EXAMS CREATE FORM) */}
          {activeTab === 'exams' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header Title */}
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Conduct a New Test</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '4px' }}>
                  Configure assessment questions, options, and security access key.
                </p>
              </div>

              {/* Title parameters card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Test Configuration</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={downloadCSVTemplate}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Download size={14} /> Download Template
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Upload size={14} /> Import File (JSON/CSV)
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".csv,.json"
                      onChange={handleFileImport}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '20px' }}>
                  <div>
                    <label className="input-label">Assessment Title</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Physics Quiz 1"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                    />
                  </div>

                  {profession === 'College / University' && (
                    <div>
                      <label className="input-label">Target Year</label>
                      <select className="input-field" value={targetYear} onChange={e => setTargetYear(e.target.value)} required>
                        <option value="" disabled>Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  )}

                  {profession === 'School' && (
                    <div>
                      <label className="input-label">Target Class</label>
                      <select className="input-field" value={targetClass} onChange={e => setTargetClass(e.target.value)} required>
                        <option value="" disabled>Select Class</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="input-label">Access Code PIN (Numeric)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 123456"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="input-label">Test Duration (Minutes)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="input-label">Total No of Students</label>
                    <input
                      type="number"
                      className="input-field"
                      value={totalStudents}
                      onChange={(e) => setTotalStudents(parseInt(e.target.value) || 50)}
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="input-label">Access Start Time</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={accessStart}
                      onChange={(e) => setAccessStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label">Access End Time</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={accessEnd}
                      onChange={(e) => setAccessEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '15px', color: '#0f172a' }}>
                        Strict Email Validation
                      </label>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        When enabled, only students with the specified emails can access this test.
                      </p>
                    </div>
                    
                    {/* Toggle Switch */}
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ position: 'relative' }}>
                        <input type="checkbox" style={{ position: 'absolute', opacity: 0, width: 0, height: 0, margin: 0, padding: 0 }} checked={strictValidation} onChange={() => setStrictValidation(!strictValidation)} />
                        <div style={{ display: 'block', width: '48px', height: '28px', backgroundColor: strictValidation ? '#ea580c' : '#cbd5e1', borderRadius: '9999px', transition: 'background-color 0.3s' }}></div>
                        <div style={{ position: 'absolute', left: strictValidation ? '22px' : '2px', top: '2px', backgroundColor: 'white', width: '24px', height: '24px', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                      </div>
                    </label>
                  </div>

                  {strictValidation && (
                    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '13px' }}>Allowed Emails (Comma-separated)</label>
                        
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#ea580c', backgroundColor: '#fff7ed', padding: '6px 12px', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                          Import Emails (CSV/TXT)
                          <input type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />
                        </label>
                      </div>
                      
                      <textarea
                        className="input-field"
                        placeholder="student1@example.com, student2@example.com"
                        value={allowedEmailsInput}
                        onChange={(e) => setAllowedEmailsInput(e.target.value)}
                        style={{ minHeight: '100px', width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* MCQ question list builder */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>MCQ Questions ({questions.length})</h3>
                  <button
                    type="button"
                    onClick={addQuestionField}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    <PlusCircle size={16} /> Add Question
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} style={{ padding: '24px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)' }}>Question #{qIdx + 1}</span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestionField(qIdx)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label className="input-label">Question Text</label>
                        <textarea
                          className="textarea-field"
                          placeholder="Type question text..."
                          value={q.text}
                          onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                        />
                      </div>

                      <div className="option-input-grid">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="option-input-item">
                            <label className="input-label">Option {String.fromCharCode(65 + optIdx)}</label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              value={opt}
                              onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                        <div>
                          <label className="input-label">Correct Answer</label>
                          <div className="correct-ans-selector">
                            {['A', 'B', 'C', 'D'].map((label, optIdx) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => updateCorrectAnswer(qIdx, optIdx)}
                                className={`correct-ans-btn ${q.correctIndex === optIdx ? 'selected' : ''}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ minWidth: '240px', flex: 1 }}>
                          <label className="input-label">Attach Image (Optional)</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              className="input-field"
                              style={{ height: '36px', fontSize: '13px' }}
                              placeholder="Paste URL..."
                              value={q.imageUrl?.startsWith('data:') ? '' : q.imageUrl || ''}
                              onChange={(e) => updateImageUrl(qIdx, e.target.value)}
                            />
                            <label className="btn btn-secondary" style={{ height: '36px', padding: '0 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Image size={14} /> Upload File
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={(e) => handleImageUpload(qIdx, e.target.files?.[0] || null)}
                              />
                            </label>
                          </div>

                          {q.imageUrl && (
                            <div className="image-preview-box">
                              <img src={q.imageUrl} className="image-preview-thumbnail" alt="" />
                              <span className="image-preview-url">{q.imageUrl.startsWith('data:') ? 'Local Image File' : q.imageUrl}</span>
                              <button type="button" onClick={() => removeQuestionImage(qIdx)} style={{ border: 'none', background: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Clear</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                  <button
                    type="submit"
                    onClick={handleCreateTest}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontWeight: '600' }}
                    disabled={loading}
                  >
                    <Send size={16} /> Publish Test
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: STUDENT SUBMISSION RESULTS TABLE */}
          {activeTab === 'students' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Student Performance Reports</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '4px' }}>
                  High-density logs of student outcomes and retry options.
                </p>
              </div>

              <div className="card">
                {attempts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-on-surface-variant)' }}>
                    No attempts submitted yet.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="density-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Student Email</th>
                          <th>Test Title</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Submitted Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map(att => {
                          const pct = Math.round((att.score / att.total_questions) * 100);
                          const isPassing = pct >= 50;
                          
                          // Determine display name
                          const studentName = att.student_email.toLowerCase().includes('harish')
                            ? 'Harish'
                            : (att.student_name || att.student_email.split('@')[0]);

                          return (
                            <tr key={att.id}>
                              <td style={{ fontWeight: '600' }}>{studentName}</td>
                              <td>{att.student_email}</td>
                              <td>{att.test_title}</td>
                              <td style={{ fontWeight: '700' }}>{att.score} / {att.total_questions}</td>
                              <td>
                                <span className={`chip ${isPassing ? 'chip-success' : 'chip-error'}`}>
                                  {pct}% {isPassing ? 'Passed' : 'Failed'}
                                </span>
                              </td>
                              <td>{new Date(att.completed_at).toLocaleDateString()}</td>
                              <td>
                                <button
                                  onClick={() => handleToggleRetry(att.id, att.allowed_retry)}
                                  disabled={syncing}
                                  className={`btn ${att.allowed_retry ? 'btn-success' : 'btn-secondary'}`}
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                  {att.allowed_retry ? 'Retry Allowed' : 'Allow Retry'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TEACHER CLASS RANKINGS LEADERBOARD VIEW */}
          {activeTab === 'leaderboard' && (() => {
            const selectedTest = tests.find(t => t.id === selectedLeaderboardTestId);

            return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Class Leaderboard Rankings</h1>
                <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: '500' }}>
                  Analyze student grade distribution and verified rankings.
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

                        {leaderboardAttempts.length === 0 ? (
                           <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No attempts yet.</div>
                        ) : (
                          <>
                            {leaderboardAttempts.map((st, i) => {
                              const rank = i + 1;
                              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                              const pct = Math.round((st.score / st.total_questions) * 100);
                              const durationText = st.time_taken_seconds
                                ? `${Math.floor(st.time_taken_seconds / 60)}m ${st.time_taken_seconds % 60}s`
                                : 'N/A';
                                
                              return (
                                <div key={st.id} title={`Student Marks: ${st.score} / ${st.total_questions}`} style={{ display: 'grid', cursor: 'help', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr', padding: '16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', transition: 'background-color 0.2s' }}>
                                  <div style={{ textAlign: 'center', fontSize: medal ? '20px' : '14px', fontWeight: '700', color: medal ? 'inherit' : '#0f172a' }}>
                                    {medal || rank}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                                      <img src={"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80"} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{st.student_name || st.student_email.split('@')[0]}</div>
                                      <div style={{ fontSize: '12px', color: '#64748b' }}>{st.student_email}</div>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{st.score}</div>
                                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#10b981' }}>{pct}%</div>
                                  <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{durationText}</div>
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      Please select a published test from the right panel to view its leaderboard.
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
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Published Test</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', backgroundColor: '#3b82f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <ClipboardEdit size={14} />
                          </div>
                          <select 
                            value={selectedLeaderboardTestId}
                            onChange={(e) => setSelectedLeaderboardTestId(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 44px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#0f172a', appearance: 'none', outline: 'none', height: '44px', backgroundColor: '#fff' }}
                          >
                            <option value="">-- Choose a test --</option>
                            {tests.map(t => (
                              <option key={t.id} value={t.id}>{t.title} (PIN: {t.access_code})</option>
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

// Inline helper for syncing icon spinning effect
interface RefreshCwShimProps {
  size: number;
  spinning: boolean;
}
function RefreshCwShim({ size, spinning }: RefreshCwShimProps) {
  return (
    <span style={{ display: 'inline-flex', animation: spinning ? 'spin 1s linear infinite' : 'none' }}>
      <RefreshCw size={size} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
}

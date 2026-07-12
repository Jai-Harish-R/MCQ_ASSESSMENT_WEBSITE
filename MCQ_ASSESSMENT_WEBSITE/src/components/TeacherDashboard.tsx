import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { 
  LayoutDashboard, PlusCircle, Plus, LogOut, 
  Trash2, Users, Award, AlertCircle, BookOpen, ChevronLeft, ChevronRight, Calendar, FileText, 
  Check, Send, GraduationCap, RefreshCw,
  Upload, Download, Image, ClipboardList,
  Trophy, ClipboardEdit, ChevronDown, BarChart3, ShieldCheck, Clock, Menu
} from 'lucide-react';
import animeAvatar from '../assets/anime_avatar.png';
import studentAvatar from '../assets/student_avatar.png';
import ProfileModal from './ProfileModal';
import HoverableTestTitle from './HoverableTestTitle';
import * as XLSX from 'xlsx';

const getLocalDateStr = (d: Date | string | number) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

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
  target_year?: string;
  target_class?: string;
  teacher_email: string;
  questions: Question[];
  no_of_questions?: number;
  duration?: number;
  total_students?: number;
  access_start?: string | null;
  access_end?: string | null;
  allowed_emails?: string[] | null;
  created_at: string;
  pass_percentage?: number;
  max_attempts?: number;
  short_id?: number;
  type?: string;
  shuffle_questions?: boolean;
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
  short_id?: number;
  profiles?: {
    full_name: string;
    short_id?: number;
  } | null;
}

interface Profile {
  id: string;
  email: string;
  short_id?: number;
  full_name: string | null;
  avatar_url: string | null;
  department?: string;
  designation?: string;
  profession?: string;
  institution_name?: string;
}

interface TeacherDashboardProps {
  user: { id: string; email: string; user_metadata?: { full_name?: string; profession?: string; avatar_url?: string } };
  onLogout: () => void;
}

export default function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  // Navigation tabs: 'dashboard' | 'exams' | 'students' | 'leaderboard' | 'edit_test'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exams' | 'students' | 'leaderboard' | 'edit_test'>('exams');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data states
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected test ID for the Leaderboard tab
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const [selectedLeaderboardTestId, setSelectedLeaderboardTestId] = useState<string>('');
  const [selectedReportTestId, setSelectedReportTestId] = useState<string>('');
  const [selectedEditTestId, setSelectedEditTestId] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<'name_asc' | 'name_desc' | 'mark_asc' | 'mark_desc' | ''>('');
  const [leaderboardAttempts, setLeaderboardAttempts] = useState<Attempt[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const itemsPerPage = 10;
  const [showAllTests, setShowAllTests] = useState(false);
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);
  
  // Export Examinees State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportCurrentMonth, setExportCurrentMonth] = useState(new Date());
  const [exportHoveredDateStr, setExportHoveredDateStr] = useState<string | null>(null);
  const [exportSelectedTests, setExportSelectedTests] = useState<string[]>([]);

  // Test form state
  const [testTitle, setTestTitle] = useState('');
  const [targetYear, setTargetYear] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const profession = user.user_metadata?.profession;
  const [accessCode, setAccessCode] = useState('');
  const [numQuestions, setNumQuestions] = useState<number>(1);

  // Advanced config state
  const [passPercentageEnabled, setPassPercentageEnabled] = useState(false);
  const [maxAttemptsEnabled, setMaxAttemptsEnabled] = useState(false);
  const [passPercentage, setPassPercentage] = useState<number>(80);
  const [maxAttempts, setMaxAttempts] = useState<number>(3);
  const [duration, setDuration] = useState(10);
  const [totalStudents, setTotalStudents] = useState(50);
  const [accessStart, setAccessStart] = useState('');
  const [accessEnd, setAccessEnd] = useState('');
  const [allowedEmailsInput, setAllowedEmailsInput] = useState('');
  const [strictValidation, setStrictValidation] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

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

  const teacherDisplayName = user.email.toLowerCase().includes('jai') 
    ? 'Jai' 
    : (user.user_metadata?.full_name || 'Educator');
  
  const [currentName, setCurrentName] = useState(teacherDisplayName);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user.user_metadata?.avatar_url || animeAvatar as any);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const getTestStatus = (t: Test) => {
    if (!t.access_start && !t.access_end) return 'Live';
    const now = new Date().getTime();
    if (t.access_start && now < new Date(t.access_start).getTime()) return 'Not Started';
    if (t.access_end && now > new Date(t.access_end).getTime()) return 'Ended';
    return 'Live';
  };

  const exportToExcel = () => {
    if (exportSelectedTests.length === 0) {
      setMsg({ type: 'error', text: 'Please select at least one test to export.' });
      return;
    }

    const workbook = XLSX.utils.book_new();

    exportSelectedTests.forEach(testId => {
      const test = tests.find(t => t.id === testId);
      if (!test) return;

      const testAttempts = attempts.filter(att => att.test_id === testId);
      const aoa = [];
      
      aoa.push([`Assessment Title: ${test.title}`]);
      aoa.push([`Assessment ID: ${test.short_id || test.id}`]);
      aoa.push([]);
      
      aoa.push(["Examinee Name", "Examinee ID", "Test Title", "Score", "Percentage", "Status", "Attempt", "Submitted Date"]);

      testAttempts.forEach(att => {
        const profile = allProfiles.find(p => p.email === att.student_email);
        const studentName = profile?.full_name || 'Unknown';
        const studentId = profile?.short_id ? `ID-${String(profile.short_id).padStart(3, '0')}` : '-';
        
        const pct = Math.round((att.score / att.total_questions) * 100);
        const passPct = test.pass_percentage || 80;
        const status = pct >= passPct ? 'Passed' : 'Failed';
        
        const studentAttempts = attempts.filter(a => a.test_id === att.test_id && a.student_email === att.student_email).sort((a,b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
        const attemptIndex = studentAttempts.findIndex(a => a.id === att.id) + 1;
        const maxAttempts = test.max_attempts || 3;
        
        const scoreStr = `${att.score} / ${att.total_questions}`;
        const pctStr = `${pct}%`;
        const attemptStr = `${attemptIndex} / ${maxAttempts}`;
        const dateStr = new Date(att.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        aoa.push([studentName, studentId, test.title, scoreStr, pctStr, status, attemptStr, dateStr]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      let sheetName = test.title.replace(/[\\/*?:[\]]/g, '').substring(0, 31);
      if (!sheetName) sheetName = 'Sheet';
      if (workbook.SheetNames.includes(sheetName)) {
        sheetName = `${sheetName.substring(0, 27)}_${Math.floor(Math.random()*1000)}`;
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    if (workbook.SheetNames.length === 0) {
       XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["No data"]]), "Sheet1");
    }

    XLSX.writeFile(workbook, `examinee_results_export_${new Date().getTime()}.xlsx`);
    setIsExportModalOpen(false);
  };

  // Load stats and tables
  const loadData = async () => {
    setLoading(true);
    setMsg(null);
    try {
      
        const { data: testsData, error: testsErr } = await supabase
          .from('tests')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        if (testsErr) throw testsErr;
        setTests(testsData || []);

        const { data: profilesData } = await supabase.from('profiles').select('*');
        if (profilesData) setAllProfiles(profilesData);

        if (testsData && testsData.length > 0) {
          const testIds = testsData.map(t => t.id);
          const { data: attemptsData, error: attemptsErr } = await supabase
            .from('test_attempts')
            .select('*, profiles(short_id)')
            .in('test_id', testIds)
            .order('completed_at', { ascending: false });

          if (attemptsErr) throw attemptsErr;

          const mappedAttempts = (attemptsData || []).map(att => {
            const t = testsData.find(x => x.id === att.test_id);
            return { ...att, short_id: att.profiles?.short_id, test_title: t ? t.title : 'Unknown Test' };
          });
          setAttempts(mappedAttempts);
        } else {
          setAttempts([]);
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
  }, [user.id]);

  // Supabase Realtime Subscription
  useEffect(() => {
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
  }, [user.id]);

  // Load leaderboard details when a test is selected in the tab
  useEffect(() => {
    if (selectedLeaderboardTestId) {
      const allForTest = attempts.filter(att => att.test_id === selectedLeaderboardTestId);
      // Sort chronologically descending to process last attempts first
      const latestFirst = [...allForTest].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
      
      const uniqueAttempts: any[] = [];
      const seenEmails = new Set();
      for (const att of latestFirst) {
        const key = att.student_email || (att as any).student_id;
        if (!seenEmails.has(key)) {
          seenEmails.add(key);
          uniqueAttempts.push(att);
        }
      }

      // Now rank the last attempts by score descending
      const ranked = uniqueAttempts.sort((a, b) => {
        const pctA = a.score / a.total_questions;
        const pctB = b.score / b.total_questions;
        if (pctB !== pctA) return pctB - pctA;
        return (a.time_taken_seconds || 0) - (b.time_taken_seconds || 0);
      });

      setLeaderboardAttempts(ranked);
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

        if (imported.length < numQuestions) {
          setNumQuestions(imported.length);
          setMsg({ type: 'success', text: `QUESTION IMPORTED : ${imported.length}\nTOTAL QUESTION : ${imported.length}` });
        } else {
          setMsg({ type: 'success', text: `QUESTION IMPORTED : ${imported.length}\nTOTAL QUESTION : ${numQuestions}` });
        }

        setQuestions(imported);
      } catch (err: any) {
        setMsg({ type: 'error', text: err.message || 'Error parsing imported file.' });
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let count = parseInt(e.target.value);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 200) count = 200; // sane limit
    
    setNumQuestions(count);
    
    setQuestions(prev => {
      const newQuestions = [...prev];
      if (count > newQuestions.length) {
        // Add new blank questions if specified count exceeds pool
        for (let i = newQuestions.length; i < count; i++) {
          newQuestions.push({ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' });
        }
      }
      // DO NOT truncate here to preserve the question bank!
      return newQuestions;
    });
  };

  const resetForm = () => {
    setTestTitle('');
    setTargetYear('');
    setTargetClass('');
    setAccessCode('');
    setNumQuestions(1);
    setPassPercentageEnabled(false);
    setMaxAttemptsEnabled(false);
    setPassPercentage(80);
    setMaxAttempts(3);
    setDuration(10);
    setTotalStudents(50);
    setAccessStart('');
    setAccessEnd('');
    setAllowedEmailsInput('');
    setStrictValidation(false);
    setShuffleQuestions(false);
    setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);
  };

  const populateForm = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    setTestTitle(test.title || '');
    setTargetYear(test.target_year || '');
    setTargetClass(test.target_class || '');
    setAccessCode(test.access_code || '');
    setPassPercentageEnabled(!!test.pass_percentage && test.pass_percentage !== 80);
    setMaxAttemptsEnabled(!!test.max_attempts && test.max_attempts !== 3);
    setPassPercentage(test.pass_percentage || 80);
    setMaxAttempts(test.max_attempts || 3);
    setDuration(test.duration || 10);
    setTotalStudents(test.total_students || 50);
    setAccessStart(test.access_start ? new Date(test.access_start).toISOString().slice(0,16) : '');
    setAccessEnd(test.access_end ? new Date(test.access_end).toISOString().slice(0,16) : '');
    setAllowedEmailsInput(test.allowed_emails ? test.allowed_emails.join(', ') : '');
    setStrictValidation(!!test.allowed_emails && test.allowed_emails.length > 0);
    setShuffleQuestions(test.shuffle_questions || false);
    
    try {
      const { data: answerData } = await supabase
        .from('test_answers')
        .select('correct_answers')
        .eq('test_id', testId)
        .single();
        
      const correctAnswersObj = answerData?.correct_answers || {};
      
      const mappedQuestions = test.questions && test.questions.length > 0 ? test.questions.map(q => ({
        text: q.text,
        options: q.options,
        correctIndex: correctAnswersObj[q.id] !== undefined ? correctAnswersObj[q.id] : 0,
        imageUrl: q.imageUrl || ''
      })) : [{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }];
      
      setQuestions(mappedQuestions);
      setNumQuestions(test.no_of_questions || mappedQuestions.length);
    } catch (e) {
      console.error('Failed to load correct answers', e);
      const mappedQuestions = test.questions && test.questions.length > 0 ? test.questions.map(q => ({
        text: q.text,
        options: q.options,
        correctIndex: 0,
        imageUrl: q.imageUrl || ''
      })) : [{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }];
      setQuestions(mappedQuestions);
      setNumQuestions(test.no_of_questions || mappedQuestions.length);
    }
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

    const activeQuestions = questions.filter((q, idx) => {
      if (idx < numQuestions) return true;
      return q.text.trim() !== '';
    });

    if (activeQuestions.length === 0) {
      setMsg({ type: 'error', text: 'You must add at least one question to the test.' });
      return;
    }

    for (let i = 0; i < activeQuestions.length; i++) {
      if (!activeQuestions[i].text.trim()) {
        setMsg({ type: 'error', text: `Question ${i + 1} text cannot be empty.` });
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!activeQuestions[i].options[j].trim()) {
          setMsg({ type: 'error', text: `Option ${j + 1} for Question ${i + 1} cannot be empty.` });
          return;
        }
      }
    }

    setLoading(true);

    try {

      const formattedQuestions: Question[] = activeQuestions.map((q, idx) => ({
        id: `q-${idx + 1}`,
        text: q.text,
        options: q.options,
        imageUrl: q.imageUrl || ''
      }));

      const correctAnswersObj = activeQuestions.reduce((acc, q, idx) => {
        acc[`q-${idx + 1}`] = q.correctIndex;
        return acc;
      }, {} as Record<string, number>);

      
        const { data: testData, error: testErr } = await supabase
          .from('tests')
          .insert({
            teacher_id: user.id,
            teacher_email: user.email,
            title: testTitle,
            access_code: accessCode,
            questions: formattedQuestions,
            type: 'test',
            target_year: targetYear || null,
            target_class: targetClass || null,
            duration: duration,
            total_students: totalStudents,
            access_start: accessStart ? new Date(accessStart).toISOString() : null,
            access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
            allowed_emails: strictValidation ? (allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : []) : null,
            pass_percentage: passPercentageEnabled ? passPercentage : 80,
            max_attempts: maxAttemptsEnabled ? maxAttempts : 3,
            no_of_questions: numQuestions,
            shuffle_questions: shuffleQuestions
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

        setMsg({ type: 'success', text: `Test "${testTitle}" created successfully! Share Test ID: ${testData.short_id} and PIN: ${accessCode}` });
        
        setTestTitle('');
        setAccessCode('');
        setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);
        setPassPercentageEnabled(false);
        setMaxAttemptsEnabled(false);
        setPassPercentage(80);
        setMaxAttempts(3);
        loadData();
        setActiveTab('exams');
      
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: err.message || 'Failed to publish test.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!selectedEditTestId) {
      setMsg({ type: 'error', text: 'Please select a test to edit.' });
      return;
    }
    if (!testTitle.trim()) {
      setMsg({ type: 'error', text: 'Test title is required.' });
      return;
    }
    if (!/^\\d{6}$/.test(accessCode.trim())) {
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

    const activeQuestions = questions.filter((q, idx) => {
      if (idx < numQuestions) return true;
      return q.text.trim() !== '';
    });

    if (activeQuestions.length === 0) {
      setMsg({ type: 'error', text: 'You must add at least one question to the test.' });
      return;
    }

    for (let i = 0; i < activeQuestions.length; i++) {
      if (!activeQuestions[i].text.trim()) {
        setMsg({ type: 'error', text: `Question ${i + 1} text cannot be empty.` });
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!activeQuestions[i].options[j].trim()) {
          setMsg({ type: 'error', text: `Option ${j + 1} for Question ${i + 1} cannot be empty.` });
          return;
        }
      }
    }

    setLoading(true);

    try {
      const formattedQuestions: Question[] = activeQuestions.map((q, idx) => ({
        id: `q-${idx + 1}`,
        text: q.text,
        options: q.options,
        imageUrl: q.imageUrl || ''
      }));

      const correctAnswersObj = activeQuestions.reduce((acc, q, idx) => {
        acc[`q-${idx + 1}`] = q.correctIndex;
        return acc;
      }, {} as Record<string, number>);
      
      const { data: testData, error: testErr } = await supabase
        .from('tests')
        .update({
          title: testTitle,
          access_code: accessCode,
          questions: formattedQuestions,
          target_year: targetYear || null,
          target_class: targetClass || null,
          duration: duration,
          total_students: totalStudents,
          access_start: accessStart ? new Date(accessStart).toISOString() : null,
          access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
          allowed_emails: strictValidation ? (allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : []) : null,
          pass_percentage: passPercentageEnabled ? passPercentage : 80,
          max_attempts: maxAttemptsEnabled ? maxAttempts : 3,
          no_of_questions: numQuestions,
          shuffle_questions: shuffleQuestions
        })
        .eq('id', selectedEditTestId)
        .select()
        .single();

      if (testErr) throw testErr;

      const { error: answersErr } = await supabase
        .from('test_answers')
        .update({
          correct_answers: correctAnswersObj
        })
        .eq('test_id', testData.id);

      if (answersErr) throw answersErr;

      setMsg({ type: 'success', text: `Test "${testTitle}" updated successfully!` });
      
      loadData();
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: err.message || 'Failed to update test.' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle Retry
  const handleToggleRetry = async (attemptId: string, currentStatus: boolean) => {
    setSyncing(true);
    try {
      
        const { error } = await supabase
          .from('test_attempts')
          .update({ allowed_retry: !currentStatus })
          .eq('id', attemptId);

        if (error) throw error;
        setAttempts(attempts.map(att => att.id === attemptId ? { ...att, allowed_retry: !currentStatus } : att));
      
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to toggle retry permission.');
    } finally {
      setSyncing(false);
    }
  };

  // Delete Test
  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? All Examinees results will be deleted.')) return;
    setLoading(true);
    try {
      
        const { error } = await supabase
          .from('tests')
          .delete()
          .eq('id', testId);

        if (error) throw error;
        loadData();
      
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete test.');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const now = new Date();
  const testsInMonth = tests.filter(t => {
    const dateStr = t.access_start || t.created_at;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  });
  
  const notStartedTestsCount = testsInMonth.filter(t => t.access_start && new Date(t.access_start) > now).length;
  const inactiveTestsCount = testsInMonth.filter(t => t.access_end && new Date(t.access_end) <= now).length;
  const activeTestsCount = testsInMonth.length - notStartedTestsCount - inactiveTestsCount;
  
  // Calendar variables
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const getLocalDateStr = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="edu-app-frame">
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Teacher Sidebar Navigation */}
      <aside className={`edu-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
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
          <div className="sidebar-profile" onClick={() => setIsProfileModalOpen(true)} style={{ cursor: 'pointer' }}>
            <img className="sidebar-profile-avatar" src={currentAvatar} alt="Teacher Avatar" style={{ objectFit: 'cover' }} />
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{currentName || 'jhgno.official'}</span>
              <span className="sidebar-profile-role" style={{ textTransform: 'uppercase', marginBottom: '2px' }}>{allProfiles.find(p => p.email === user.email)?.designation || 'EXAMINER'}</span>
              <span className="sidebar-profile-role" style={{ fontSize: '11px', color: '#94a3b8' }}>ID - {allProfiles.find(p => p.email === user.email)?.short_id || '-'}</span>
            </div>
          </div>

          {/* Sidebar Menu list */}
          <ul className="sidebar-menu">
            <li>
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`sidebar-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                Dashboard Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('exams');
                  resetForm();
                  setIsMobileMenuOpen(false);
                }}
                className={`sidebar-item-btn ${activeTab === 'exams' ? 'active' : ''}`}
              >
                <BookOpen size={18} />
                Conduct Test (Create)
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('edit_test');
                  resetForm();
                  setSelectedEditTestId('');
                  setIsMobileMenuOpen(false);
                }}
                className={`sidebar-item-btn ${activeTab === 'edit_test' ? 'active' : ''}`}
              >
                <ClipboardEdit size={18} />
                Edit Test
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }}
                className={`sidebar-item-btn ${activeTab === 'students' ? 'active' : ''}`}
              >
                <ClipboardList size={18} />
                Examinees Results
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('leaderboard');
                  if (tests.length > 0 && !selectedLeaderboardTestId) {
                    setSelectedLeaderboardTestId(tests[0].id);
                  }
                  setIsMobileMenuOpen(false);
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
          <div className="header-title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="hamburger-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.02em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            </span>
          </div>
          <div className="header-actions">
            <button onClick={loadData} className="header-icon-btn" title="Sync database data">
              <RefreshCwShim size={16} spinning={loading} />
            </button>
            <img className="header-avatar" src={currentAvatar} alt="Teacher Avatar" onClick={() => setIsProfileModalOpen(true)} style={{ cursor: 'pointer', objectFit: 'cover' }} />
          </div>
        </header>

        {/* Content Workspace container (1-column clean layout) */}
        <div className="workspace-container">

          {/* Centered Notifications Modal Overlay */}
          {msg && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
            }}>
              <div style={{
                backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', width: '400px',
                maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px'
              }}>
                {msg.type === 'error' ? (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={24} />
                  </div>
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={24} />
                  </div>
                )}
                
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  {msg.type === 'error' ? 'Notice' : 'Success'}
                </h3>
                
                <p style={{ fontSize: '15px', color: '#475569', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                  {typeof msg.text === 'object' ? JSON.stringify(msg.text) : String(msg.text)}
                </p>
                
                <button
                  onClick={() => setMsg(null)}
                  style={{
                    marginTop: '16px', width: '100%', padding: '12px', backgroundColor: '#f1f5f9',
                    color: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '15px',
                    fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header Title */}
              <div>
                {(() => {
                  const myProfile = allProfiles.find(p => p.id === user.id);
                  const teacherName = myProfile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0] || 'Teacher';
                  
                  const roleTxt = `ID: ${myProfile?.short_id || '-'}`;
                  const instTxt = myProfile?.institution_name || 'a Organization';
                  const subtitleText = `${roleTxt} in ${instTxt}`;

                  return (
                    <>
                      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Examiner Dashboard </h1>
                      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#334155', margin: '0 0 4px 0' }}>Welcome back, {teacherName} 👋</h2>
                      <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', textTransform: 'capitalize', margin: 0 }}>
                        {subtitleText}
                      </h4>
                    </>
                  );
                })()}
              </div>

              {/* Stats overview boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-success-container)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Active Tests</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{activeTestsCount}</h3>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-error-container)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Inactive Tests</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{inactiveTestsCount}</h3>
                  </div>
                </div>
                
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-variant)', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>Not Started</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{notStartedTestsCount}</h3>
                  </div>
                </div>
              </div>

              {/* Monthly Calendar */}
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setCurrentMonth(new Date())} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>Today</button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>&lt;</button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>&gt;</button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '12px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{day}</div>
                  ))}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', flex: 1 }}>
                  {Array.from({ length: 42 }).map((_, i) => {
                    const dateNum = i - firstDay + 1;
                    const isCurrentMonth = dateNum > 0 && dateNum <= daysInMonth;
                    const displayNum = isCurrentMonth ? dateNum : (dateNum <= 0 ? getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth() - 1) + dateNum : dateNum - daysInMonth);
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    
                    const currentDateString = getLocalDateStr(new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum));
                    const isToday = isCurrentMonth && displayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    
                    const dayTests = tests.filter(t => getLocalDateStr(t.access_start || t.created_at) === currentDateString);

                    return (
                      <div key={i} className="calendar-hover-wrapper"
                        onMouseEnter={() => setHoveredDateStr(currentDateString)}
                        onMouseLeave={() => setHoveredDateStr(null)}
                        style={{ 
                          position: 'relative', padding: '12px 0 24px', fontSize: '14px', fontWeight: '600', 
                          color: isCurrentMonth ? (isToday ? '#ea580c' : '#0f172a') : '#cbd5e1',
                          backgroundColor: isToday ? '#fff7ed' : 'transparent',
                          borderRadius: '12px', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                        {displayNum}
                        
                        {dayTests.length > 0 && (
                          <>
                            <div style={{ position: 'absolute', bottom: '8px', display: 'flex', gap: '4px' }}>
                              {dayTests.map((t, idx) => (
                                <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }}></div>
                              ))}
                            </div>
                            
                            {hoveredDateStr === currentDateString && (
                              <div className="calendar-hover-card" style={{ 
                                display: 'block', zIndex: 100, width: '480px', padding: '16px', borderRadius: '16px', 
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                ...(i % 7 >= 4 ? { left: 'auto', right: '0%', transform: 'none' } : (i % 7 <= 2 ? { left: '0%', right: 'auto', transform: 'none' } : {}))
                              }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0' }}>
                                  {new Date(currentDateString).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr 1fr', gap: '8px', fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', paddingBottom: '4px', borderBottom: '1px dashed #e2e8f0' }}>
                                    <span>Exam Name</span>
                                    <span>ID</span>
                                    <span>Code</span>
                                    <span>Att</span>
                                    <span>Pass</span>
                                    <span>Fail</span>
                                    <span>Status</span>
                                  </div>
                                  {dayTests.map(t => {
                                    const tAttempts = attempts.filter(a => a.test_id === t.id);
                                    const passThreshold = t.pass_percentage || 80;
                                    let passes = 0, fails = 0;
                                    tAttempts.forEach(a => {
                                      const pct = Math.round((a.score / a.total_questions) * 100);
                                      if (pct >= passThreshold) passes++; else fails++;
                                    });
                                    const statusStr = getTestStatus(t);
                                    let statusColor = '#16a34a';
                                    if (statusStr === 'Ended') statusColor = '#ef4444';
                                    if (statusStr === 'Not Started') statusColor = '#f59e0b';
                                    
                                    return (
                                      <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr 1fr', gap: '8px', fontSize: '11px', textAlign: 'left', alignItems: 'center' }}>
                                        <HoverableTestTitle title={t.title} />
                                        <span style={{ color: '#64748b' }}>{t.short_id || '-'}</span>
                                        <span style={{ color: '#0f172a', fontWeight: '600' }}>{t.access_code || '-'}</span>
                                        <span style={{ color: '#64748b', fontWeight: '600' }}>{tAttempts.length}</span>
                                        <span style={{ color: passes > 0 ? '#16a34a' : '#64748b', fontWeight: '600' }}>{passes}</span>
                                        <span style={{ color: fails > 0 ? '#ef4444' : '#64748b', fontWeight: '600' }}>{fails}</span>
                                        <span style={{ color: statusColor, fontWeight: '700' }}>{statusStr}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
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
                    {tests.slice(0, showAllTests ? tests.length : 5).map(test => (
                      <div key={test.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-default)' }}>
                        <div>
                          <HoverableTestTitle 
                            title={test.title} 
                            shortId={test.short_id} 
                            questionsCount={test.questions?.length || 0} 
                            duration={test.duration} 
                            testCode={test.access_code}
                            customStyle={{ fontSize: '15px', fontWeight: '600' }} 
                          />
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
                    
                    {tests.length > 5 && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                        <button onClick={() => setShowAllTests(!showAllTests)} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                          {showAllTests ? 'Show Less' : 'View All Assessments'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2 & 5: CONDUCT TEST (EXAMS CREATE FORM) & EDIT TEST */}
          {(activeTab === 'exams' || activeTab === 'edit_test') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header Title */}
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700' }}>{activeTab === 'edit_test' ? 'Edit Test' : 'Conduct a New Test'}</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '4px' }}>
                  {activeTab === 'edit_test' ? 'Select a test to modify its settings and questions.' : 'Configure assessment questions, options, and security access key.'}
                </p>
              </div>

              {activeTab === 'edit_test' && (
                <div className="card" style={{ marginBottom: '0px' }}>
                  <label className="input-label">Select Test to Edit</label>
                  <select
                    className="input-field"
                    value={selectedEditTestId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedEditTestId(id);
                      if (id) {
                        populateForm(id);
                      } else {
                        resetForm();
                      }
                    }}
                    style={{ backgroundColor: '#f8fafc', padding: '12px' }}
                  >
                    <option value="">-- Choose a test --</option>
                    {tests.filter(t => getTestStatus(t) !== 'Ended').map(t => (
                      <option key={t.id} value={t.id} title={`${t.title}${t.short_id ? ` - ${t.short_id}` : ''}`}>{t.title.length > 10 ? t.title.substring(0, 10) + '...' : t.title} {t.short_id ? `- ${t.short_id}` : ''}</option>
                    ))}
                  </select>
                </div>
              )}

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
                    <label className="input-label">Number of Questions (Max 200 Questions)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={numQuestions}
                      onChange={handleNumQuestionsChange}
                      min={1}
                      max={200}
                      disabled={activeTab === 'edit_test'}
                      title={activeTab === 'edit_test' ? "Number of questions cannot be changed in Edit mode." : ""}
                      style={{ backgroundColor: activeTab === 'edit_test' ? '#e2e8f0' : '#fff' }}
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
                    <label className="input-label">Total Examinees</label>
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
                        Authorized Email Access
                      </label>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        When enabled, only Examinees with the specified emails can access this test.
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
                        placeholder="examinee@example.com, examinee2@example.com"
                        value={allowedEmailsInput}
                        onChange={(e) => setAllowedEmailsInput(e.target.value)}
                        style={{ minHeight: '100px', width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Configurations */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Set Pass Percentage</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Set the minimum passing percentage required. (By default 80%)</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: passPercentageEnabled ? '#3b82f6' : '#cbd5e1', borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => setPassPercentageEnabled(!passPercentageEnabled)}>
                      <div style={{ position: 'absolute', top: '2px', left: passPercentageEnabled ? '22px' : '2px', width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </div>

                {passPercentageEnabled && (
                  <div style={{ marginBottom: '10px' }}>
                      <label className="input-label">Set Pass Percentage (%)</label>
                      <input 
                        type="number" 
                        min="1" max="100" 
                        className="input-field" 
                        value={passPercentage} 
                        onChange={(e) => setPassPercentage(parseInt(e.target.value) || 80)} 
                        placeholder="e.g. 80" 
                      />
                  </div>
                )}
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Set Attempt Limit</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Set the maximum number of attempts allowed. (By default 3 attempts)</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: maxAttemptsEnabled ? '#3b82f6' : '#cbd5e1', borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => setMaxAttemptsEnabled(!maxAttemptsEnabled)}>
                      <div style={{ position: 'absolute', top: '2px', left: maxAttemptsEnabled ? '22px' : '2px', width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </div>

                {maxAttemptsEnabled && (
                  <div style={{ marginBottom: '10px' }}>
                      <label className="input-label">Set Max Attempts</label>
                      <input 
                        type="number" 
                        min="1" max="10" 
                        className="input-field" 
                        value={maxAttempts} 
                        onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 3)} 
                        placeholder="e.g. 3" 
                      />
                  </div>
                )}
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Shuffle Questions</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Randomize the order of questions for each student taking the test.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: shuffleQuestions ? '#3b82f6' : '#cbd5e1', borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => setShuffleQuestions(!shuffleQuestions)}>
                      <div style={{ position: 'absolute', top: '2px', left: shuffleQuestions ? '22px' : '2px', width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MCQ question list builder */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>MCQ Questions ({Math.min(questions.length, numQuestions)})</h3>
                  {activeTab !== 'edit_test' && (
                    <button 
                      type="button" 
                      onClick={() => { setNumQuestions(prev => prev + 1); setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', color: '#ea580c', backgroundColor: 'transparent', border: '1px solid #ea580c', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <PlusCircle size={16} /> Add Question
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {questions.slice(0, numQuestions).map((q, qIdx) => (
                    <div key={qIdx} style={{ padding: '24px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c' }}>Question #{qIdx + 1}</span>
                        {activeTab !== 'edit_test' && (
                          <button 
                            type="button" 
                            disabled={numQuestions <= 1}
                            onClick={() => {
                              if (numQuestions <= 1) return;
                              setNumQuestions(prev => prev - 1);
                              setQuestions(questions.filter((_, i) => i !== qIdx));
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: numQuestions <= 1 ? '#cbd5e1' : '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: numQuestions <= 1 ? 'not-allowed' : 'pointer' }}
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
                    type="button"
                    onClick={activeTab === 'edit_test' ? handleUpdateTest : handleCreateTest}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontWeight: '600' }}
                    disabled={loading || (activeTab === 'edit_test' && !selectedEditTestId)}
                  >
                    <Send size={16} /> {activeTab === 'edit_test' ? 'Update Test' : 'Publish Test'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: STUDENT SUBMISSION RESULTS TABLE */}
          {activeTab === 'students' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Hero Banner Header */}
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '24px 32px', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ zIndex: 10 }}>
                  <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 4px 0' }}>Examinee Performance Reports</h1>
                  <p style={{ color: '#475569', fontSize: '15px', margin: 0 }}>
                    Review high-density logs of examinee outcomes and retry options.
                  </p>
                </div>
                <div style={{ zIndex: 10 }}>
                  <button 
                    onClick={() => setIsExportModalOpen(true)}
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Download size={18} /> Export Examinees Results
                  </button>
                </div>
                
                {/* CSS/Icon Illustration Mock */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', opacity: 0.9, zIndex: 10 }}>
                  <div style={{ width: '140px', height: '90px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#60a5fa' }}></div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
                        <div style={{ width: '8px', height: '24px', backgroundColor: '#93c5fd', borderRadius: '2px' }}></div>
                        <div style={{ width: '8px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                        <div style={{ width: '8px', height: '16px', backgroundColor: '#bfdbfe', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginBottom: '6px' }}></div>
                      <div style={{ width: '60%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                </div>

                {/* Background Blobs for Hero */}
                <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 1 }}></div>
              </div>

              {/* Content Wrapper for alignment with Hero Banner Text */}
              <div style={{ padding: '0 32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Dropdowns Container */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                
                {/* Select Conducted Test */}
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Select Conducted Test</label>
                  
                  <div style={{ position: 'relative', width: '100%', border: '1px solid #3b82f6', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,0.08)', transition: 'all 0.2s ease', cursor: 'pointer' }} className="custom-select-container">
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden', flex: 1 }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                      <ClipboardEdit size={20} strokeWidth={2.5} />
                    </div>
                    <HoverableTestTitle 
                      title={selectedReportTestId && tests.find(t => t.id === selectedReportTestId) ? tests.find(t => t.id === selectedReportTestId)!.title : '-- Choose a test --'} 
                      shortId={selectedReportTestId && tests.find(t => t.id === selectedReportTestId)?.short_id}
                      questionsCount={selectedReportTestId ? tests.find(t => t.id === selectedReportTestId)?.questions?.length : undefined}
                      duration={selectedReportTestId ? tests.find(t => t.id === selectedReportTestId)?.duration : undefined}
                      testCode={selectedReportTestId ? tests.find(t => t.id === selectedReportTestId)?.access_code : undefined}
                      customStyle={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {selectedReportTestId && tests.find(t => t.id === selectedReportTestId) && (() => {
                      const status = getTestStatus(tests.find(t => t.id === selectedReportTestId)!);
                      let bg = '#dcfce7', color = '#16a34a', dot = '🟢';
                      if (status === 'Not Started') { bg = '#fee2e2'; color = '#ef4444'; dot = '🔴'; }
                      if (status === 'Ended') { bg = '#f1f5f9'; color = '#64748b'; dot = '⚪'; }
                      return (
                        <span style={{ backgroundColor: bg, color: color, padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {dot} {status}
                        </span>
                      );
                    })()}
                    <ChevronDown size={20} color="#0f172a" style={{ opacity: 0.6 }} />
                  </div>

                  {/* Hidden Native Select overlays the entire container */}
                  <select 
                    value={selectedReportTestId}
                    onChange={(e) => {
                      setSelectedReportTestId(e.target.value);
                      setLeaderboardPage(1);
                    }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', appearance: 'none' }}
                  >
                    <option value="">-- Choose a test --</option>
                    {tests.map(t => (
                      <option key={t.id} value={t.id} title={`${t.title}${t.short_id ? ` - ${t.short_id}` : ''}`}>{t.title.length > 10 ? t.title.substring(0, 10) + '...' : t.title} {t.short_id ? `- ${t.short_id}` : ''}</option>
                    ))}
                  </select>
                </div>
                </div>

                {/* Sort By Dropdown */}
                <div style={{ flex: '0 0 250px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Sort By</label>
                  
                  <div style={{ position: 'relative', width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      {sortConfig === 'name_asc' ? 'Student Name (A-Z)' : 
                       sortConfig === 'name_desc' ? 'Student Name (Z-A)' : 
                       sortConfig === 'mark_asc' ? 'Mark (Low-High)' : 
                       sortConfig === 'mark_desc' ? 'Mark (High-Low)' : 
                       'Default (Date)'}
                    </span>
                    <ChevronDown size={20} color="#0f172a" style={{ opacity: 0.6 }} />
                    <select 
                      value={sortConfig}
                      onChange={(e) => setSortConfig(e.target.value as any)}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', appearance: 'none' }}
                    >
                      <option value="">Default (Date)</option>
                      <option value="name_asc">Student Name (A-Z)</option>
                      <option value="name_desc">Student Name (Z-A)</option>
                      <option value="mark_asc">Mark (Low-High)</option>
                      <option value="mark_desc">Mark (High-Low)</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="card" style={{ }}>
                {!selectedReportTestId ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-on-surface-variant)' }}>
                    Please select a test from the dropdown to view examinee results.
                  </div>
                ) : attempts.filter(att => att.test_id === selectedReportTestId).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-on-surface-variant)' }}>
                    No attempts submitted yet for this test.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="density-table">
                      <thead>
                        <tr>
                          <th>Examinee Name</th>
                          <th>Examinee ID</th>
                          <th>Test Title</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Status</th>
                          <th>Attempt</th>
                          <th>Submitted Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                           const filtered = attempts.filter(att => att.test_id === selectedReportTestId);
                           const grouped = new Map();
                           for (const att of filtered) {
                             const key = `${att.test_id}-${att.student_email}`;
                             if (!grouped.has(key)) {
                               grouped.set(key, att);
                             } else {
                               const existing = grouped.get(key);
                               if (new Date(att.completed_at).getTime() > new Date(existing.completed_at).getTime()) {
                                 grouped.set(key, att);
                               }
                             }
                           }
                           return Array.from(grouped.values())
                             .map(att => {
                                const profile = allProfiles.find(p => p.email === att.student_email);
                                const displayName = profile?.full_name || att.student_name || att.student_email.split('@')[0];
                                const displayAvatar = profile?.avatar_url || studentAvatar as any;
                                return { ...att, display_name: displayName, display_avatar: displayAvatar, display_id: att.short_id !== undefined ? att.short_id : profile?.short_id };
                              })
                             .sort((a, b) => {
                               if (sortConfig === 'name_asc') return a.display_name.localeCompare(b.display_name);
                               if (sortConfig === 'name_desc') return b.display_name.localeCompare(a.display_name);
                               if (sortConfig === 'mark_asc') return a.score - b.score;
                               if (sortConfig === 'mark_desc') return b.score - a.score;
                               return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(); // default
                             })
                             .map(att => {
                          const testDetails = tests.find(t => t.id === att.test_id);
                          const currentPassPct = testDetails?.pass_percentage || 80;
                          const currentMaxAttempts = testDetails?.max_attempts || 3;
                          const pct = Math.round((att.score / att.total_questions) * 100);
                          const isPassing = pct >= currentPassPct;
                          
                          // Calculate attempt number by counting chronologically older attempts by same student for same test
                          const studentAttempts = attempts.filter(a => a.test_id === att.test_id && a.student_email === att.student_email).sort((a,b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
                          const attemptIndex = studentAttempts.findIndex(a => a.id === att.id) + 1;

                          return (
                            <tr key={att.id}>
                              <td style={{ fontWeight: '600' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img src={(att as any).display_avatar} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <span>{att.display_name}</span>
                                </div>
                              </td>
                              <td style={{ color: '#64748b' }}>{(att as any).display_id !== undefined ? `ID: ${(att as any).display_id}` : 'LOADING...'}</td>
                              <td><HoverableTestTitle title={att.test_title?.replace(/\s*-.*$/, '') || 'Assessment'} shortId={att.short_id} /></td>
                              <td style={{ fontWeight: '700' }}>{att.score} / {att.total_questions}</td>
                              <td>{pct}%</td>
                              <td>
                                <span className={`chip ${isPassing ? 'chip-success' : 'chip-error'}`}>
                                  {isPassing ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                              <td style={{ fontWeight: '600', color: '#64748b' }}>({attemptIndex}/{currentMaxAttempts})</td>
                              <td>{new Date(att.completed_at).toLocaleDateString()}</td>
                              <td>
                                <button
                                  onClick={() => handleToggleRetry(att.id, att.allowed_retry)}
                                  disabled={syncing}
                                  className={`btn ${att.allowed_retry ? 'btn-danger' : 'btn-outline'}`}
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                  {att.allowed_retry ? 'Revoke Retry' : 'Allow Retry'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEACHER CLASS RANKINGS LEADERBOARD VIEW */}
          {activeTab === 'leaderboard' && (() => {
            const selectedTest = tests.find(t => t.id === selectedLeaderboardTestId);

            return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Assessment Leaderboard Rankings</h1>
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
                            <HoverableTestTitle 
                              title={selectedTest.title}
                              shortId={selectedTest.short_id}
                              questionsCount={selectedTest.questions?.length || 0}
                              duration={selectedTest.duration}
                              testCode={selectedTest.access_code}
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

                        {leaderboardAttempts.length === 0 ? (
                           <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No attempts yet.</div>
                        ) : (
                          <>
                            {leaderboardAttempts.slice((leaderboardPage - 1) * itemsPerPage, leaderboardPage * itemsPerPage).map((st, i) => {
                              const rank = (leaderboardPage - 1) * itemsPerPage + i + 1;
                              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                              const pct = Math.round((st.score / st.total_questions) * 100);
                              const durationText = st.time_taken_seconds
                                ? `${Math.floor(st.time_taken_seconds / 60)}m ${st.time_taken_seconds % 60}s`
                                : 'N/A';
                              const profile = allProfiles.find(p => p.email === st.student_email);
                              const displayName = profile?.full_name || st.student_name || st.student_email.split('@')[0];
                              const displayAvatar = profile?.avatar_url || studentAvatar as any;

                              const isPassing = pct >= (selectedTest?.pass_percentage || 80);

                              return (
                                <div key={st.id} title={`Student Marks: ${st.score} / ${st.total_questions}`} style={{ display: 'grid', cursor: 'help', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr', padding: '16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', transition: 'background-color 0.2s' }}>
                                  <div style={{ textAlign: 'center', fontSize: medal ? '20px' : '14px', fontWeight: '700', color: medal ? 'inherit' : '#0f172a' }}>
                                    {medal || rank}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                                      <img src={displayAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{displayName}</div>
                                      <div style={{ fontSize: '12px', color: '#64748b' }}>{profile?.id ? profile.id.substring(0, 8).toUpperCase() : 'UNKNOWN ID'}</div>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{st.score}</div>
                                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#10b981' }}>{pct}%</div>
                                  <div style={{ textAlign: 'center' }}>
                                    <span className={`chip ${isPassing ? 'chip-success' : 'chip-error'}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                      {isPassing ? 'Pass' : 'Fail'}
                                    </span>
                                  </div>
                                  <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{durationText}</div>
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
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Select Test</label>
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
                              <option key={t.id} value={t.id} title={`${t.title}${t.short_id ? ` - ${t.short_id}` : ''}`}>{t.title.length > 10 ? t.title.substring(0, 10) + '...' : t.title} {t.short_id ? `- ${t.short_id}` : ''}</option>
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

      {/* Export Results Modal */}
      {isExportModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button 
              onClick={() => setIsExportModalOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <LogOut size={20} />
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Export Results</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Select tests from the calendar to export their examinee results.</p>
            
            {/* Calendar for Selection */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{exportCurrentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setExportCurrentMonth(new Date())} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>Today</button>
                    <button onClick={() => setExportCurrentMonth(new Date(exportCurrentMonth.getFullYear(), exportCurrentMonth.getMonth() - 1, 1))} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>&lt;</button>
                    <button onClick={() => setExportCurrentMonth(new Date(exportCurrentMonth.getFullYear(), exportCurrentMonth.getMonth() + 1, 1))} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>&gt;</button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '12px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{day}</div>
                  ))}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {Array.from({ length: 42 }).map((_, i) => {
                    const daysInMonth = new Date(exportCurrentMonth.getFullYear(), exportCurrentMonth.getMonth() + 1, 0).getDate();
                    const firstDay = new Date(exportCurrentMonth.getFullYear(), exportCurrentMonth.getMonth(), 1).getDay();
                    const dateNum = i - firstDay + 1;
                    const isCurrentMonth = dateNum > 0 && dateNum <= daysInMonth;
                    const displayNum = isCurrentMonth ? dateNum : (dateNum <= 0 ? new Date(exportCurrentMonth.getFullYear(), exportCurrentMonth.getMonth(), 0).getDate() + dateNum : dateNum - daysInMonth);
                    const year = exportCurrentMonth.getFullYear();
                    const month = exportCurrentMonth.getMonth();
                    
                    const currentDateString = getLocalDateStr(new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum));
                    const isToday = isCurrentMonth && displayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    
                    const dayTests = tests.filter(t => getLocalDateStr(t.access_start || t.created_at) === currentDateString);

                    return (
                      <div key={i} className="calendar-hover-wrapper"
                        onClick={() => setExportHoveredDateStr(exportHoveredDateStr === currentDateString ? null : currentDateString)}
                        style={{ 
                          position: 'relative', padding: '12px 0 24px', fontSize: '14px', fontWeight: '600', 
                          color: isCurrentMonth ? (isToday ? '#ea580c' : '#0f172a') : '#cbd5e1',
                          backgroundColor: isToday ? '#fff7ed' : 'transparent',
                          borderRadius: '12px', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                        {displayNum}
                        
                        {dayTests.length > 0 && (
                          <>
                            <div style={{ position: 'absolute', bottom: '8px', display: 'flex', gap: '4px' }}>
                              {dayTests.map((t, idx) => (
                                <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: exportSelectedTests.includes(t.id) ? '#3b82f6' : '#ea580c' }}></div>
                              ))}
                            </div>
                            
                            {exportHoveredDateStr === currentDateString && (
                              <div className="calendar-hover-card" 
                                onClick={(e) => e.stopPropagation()}
                                style={{ 
                                display: 'block', zIndex: 100, width: '320px', padding: '16px', borderRadius: '16px', 
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                ...(i % 7 >= 4 ? { left: 'auto', right: '0%', transform: 'none' } : (i % 7 <= 2 ? { left: '0%', right: 'auto', transform: 'none' } : {}))
                              }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0' }}>
                                  {new Date(currentDateString).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {dayTests.map((t, idx) => {
                                    const truncatedTitle = t.title.length > 7 ? t.title.substring(0, 7) + '...' : t.title;
                                    const displayTitle = `${truncatedTitle}${t.short_id ? ` - ${t.short_id}` : ''}`;
                                    return (
                                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }} title={t.title}>
                                      <input 
                                        type="checkbox" 
                                        checked={exportSelectedTests.includes(t.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setExportSelectedTests([...exportSelectedTests, t.id]);
                                          } else {
                                            setExportSelectedTests(exportSelectedTests.filter(id => id !== t.id));
                                          }
                                        }}
                                        style={{ accentColor: '#ea580c' }}
                                      />
                                      <span style={{ fontWeight: '600' }}>{displayTitle}</span>
                                    </label>
                                  )})}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '14px', fontWeight: '600', color: '#64748b', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={exportToExcel}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                disabled={exportSelectedTests.length === 0}
              >
                <Download size={16} /> Export Selected ({exportSelectedTests.length})
              </button>
            </div>
          </div>
        </div>
      )}

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

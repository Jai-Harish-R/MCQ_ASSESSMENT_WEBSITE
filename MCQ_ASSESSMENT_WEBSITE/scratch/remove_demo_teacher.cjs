const fs = require('fs');

let p = 'src/components/TeacherDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Remove isDemo from props
c = c.replace(
  "  isDemo: boolean;",
  ""
);
c = c.replace(
  "export default function TeacherDashboard({ user, isDemo, onLogout }: TeacherDashboardProps) {",
  "export default function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {"
);

// 2. loadData
const loadDataTarget = `      if (isDemo) {
        const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        const myTests = localTests.filter(t => t.teacher_email.toLowerCase() === user.email.toLowerCase());
        setTests(myTests);

        const localAttempts: Attempt[] = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        const myTestIds = myTests.map(t => t.id);
        const myAtt = localAttempts.filter(att => myTestIds.includes(att.test_id));
        setAttempts(myAtt.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()));
        
        setIsLoading(false);
      } else {`;
c = c.replace(loadDataTarget, "");

c = c.replace(
  `        setIsLoading(false);
      }`,
  `        setIsLoading(false);`
);

// 3. handleCreateTest
const createTestTarget = `      const testId = isDemo ? 'test-' + Date.now() : undefined;
      const formattedQuestions: Question[] = questions.map((q, idx) => ({
        id: \`q-\${idx + 1}\`,
        text: q.text,
        options: q.options,
        imageUrl: q.imageUrl || ''
      }));

      const correctAnswersObj = questions.reduce((acc, q, idx) => {
        acc[\`q-\${idx + 1}\`] = q.correctIndex;
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

        setMsg({ type: 'success', text: \`Test "\${testTitle}" created successfully in Demo Mode! Access code: \${accessCode}\` });
        
        setTestTitle('');
        setAccessCode('');
        setTargetYear('');
        setTargetClass('');
        setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);
        loadData();
        setActiveTab('exams');
      } else {`;

const createTestReplace = `      const formattedQuestions: Question[] = questions.map((q, idx) => ({
        id: \`q-\${idx + 1}\`,
        text: q.text,
        options: q.options,
        imageUrl: q.imageUrl || ''
      }));

      const correctAnswersObj = questions.reduce((acc, q, idx) => {
        acc[\`q-\${idx + 1}\`] = q.correctIndex;
        return acc;
      }, {} as Record<string, number>);`;

c = c.replace(createTestTarget, createTestReplace);

c = c.replace(
  `        setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);
        loadData();
        setActiveTab('exams');
      }`,
  `        setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);
        loadData();
        setActiveTab('exams');`
);

// 4. handleToggleRetry
const toggleTarget = `      if (isDemo) {
        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        const updated = localAttempts.map((att: any) => {
          if (att.id === attemptId) {
            return { ...att, allowed_retry: !currentStatus };
          }
          return att;
        });
        localStorage.setItem('demo_attempts', JSON.stringify(updated));
        setAttempts(attempts.map(att => att.id === attemptId ? { ...att, allowed_retry: !currentStatus } : att));
      } else {`;
c = c.replace(toggleTarget, "");

c = c.replace(
  `        setAttempts(attempts.map(att => att.id === attemptId ? { ...att, allowed_retry: !currentStatus } : att));
      }`,
  `        setAttempts(attempts.map(att => att.id === attemptId ? { ...att, allowed_retry: !currentStatus } : att));`
);

// 5. deleteTest
const deleteTarget = `      if (isDemo) {
        const localTests = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        const updated = localTests.filter((t: any) => t.id !== testId);
        localStorage.setItem('demo_tests', JSON.stringify(updated));
        
        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        const updatedAtt = localAttempts.filter((a: any) => a.test_id !== testId);
        localStorage.setItem('demo_attempts', JSON.stringify(updatedAtt));
        
        loadData();
      } else {`;
c = c.replace(deleteTarget, "");

c = c.replace(
  `        if (error) throw error;
        loadData();
      }`,
  `        if (error) throw error;
        loadData();`
);

// remove isDemo dependencies
c = c.replace(/, isDemo\]/g, "]");
c = c.replace(/isDemo, /g, "");

fs.writeFileSync(p, c);
console.log('TeacherDashboard.tsx demo mode removed.');

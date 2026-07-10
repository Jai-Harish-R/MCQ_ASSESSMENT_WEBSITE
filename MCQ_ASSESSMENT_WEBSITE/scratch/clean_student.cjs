const fs = require('fs');

let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Remove the entire seedDemoData function and the massive arrays
const seedStart = c.indexOf('// Demo Data Seeder');
const seedEnd = c.indexOf('export default function StudentPortal');
if (seedStart !== -1 && seedEnd !== -1) {
  c = c.substring(0, seedStart) + c.substring(seedEnd);
}

// 2. Remove isDemo from props
c = c.replace(
  "  isDemo: boolean;",
  ""
);
c = c.replace(
  "export default function StudentPortal({ user, isDemo, onLogout }: StudentPortalProps) {",
  "export default function StudentPortal({ user, onLogout }: StudentPortalProps) {"
);

// 3. Remove simple if (isDemo) returns
c = c.replace(/if\s*\(\s*isDemo\s*\)\s*return;/g, '');
c = c.replace(/if\s*\(\s*isDemo\s*\|\|\s*!leaderboardSelectedTestId\)\s*return;/g, 'if (!leaderboardSelectedTestId) return;');

// 4. Strip if (isDemo) branches without breaking braces.
const replaceBlock = (target, replacement) => {
  if (c.includes(target)) {
    c = c.replace(target, replacement);
  } else {
    console.error("Target not found:\n" + target.substring(0, 50));
  }
};

// loadPortalData
replaceBlock(
`    if (isDemo) {
      seedDemoData();
      const localAttempts: Attempt[] = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
      const myAtt = localAttempts.filter(att => att.student_email.toLowerCase() === user.email.toLowerCase());
      setMyAttempts(myAtt.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()));
      
      const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
      setAvailableTests(localTests);
      setIsLoadingData(false);
    } else {
      const { data: attData, error: attErr } = await supabase`,
`      const { data: attData, error: attErr } = await supabase`
);
replaceBlock(
`      setAvailableTests(testsData || []);
      setIsLoadingData(false);
    }`,
`      setAvailableTests(testsData || []);
      setIsLoadingData(false);`
);

// verifyAccessCode
replaceBlock(
`      if (isDemo) {
        const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        const t = localTests.find(x => x.access_code === code);
        if (!t) throw new Error('Invalid Test PIN or Test Not Found.');
        testData = t;
      } else {
        const { data, error: fetchErr } = await supabase`,
`        const { data, error: fetchErr } = await supabase`
);
replaceBlock(
`        if (fetchErr) throw fetchErr;
        testData = data;
      }`,
`        if (fetchErr) throw fetchErr;
        testData = data;`
);

// verifyAccessCode -> allowed check
replaceBlock(
`      if (isDemo) {
        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        existing = localAttempts.find((a: any) => a.test_id === testData.id && a.student_email.toLowerCase() === user.email.toLowerCase());
      } else {
        const { data: attData, error: attErr } = await supabase`,
`        const { data: attData, error: attErr } = await supabase`
);
replaceBlock(
`        if (attErr && attErr.code !== 'PGRST116') throw attErr;
        existing = attData;
      }`,
`        if (attErr && attErr.code !== 'PGRST116') throw attErr;
        existing = attData;`
);

// fetchLeaderboardForTest
replaceBlock(
`    if (isDemo) {
      const localAttempts: Attempt[] = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
      const allForTest = localAttempts.filter(att => att.test_id === leaderboardSelectedTestId);
      const sorted = allForTest.sort((a, b) => b.score - a.score || (a.time_taken_seconds || 0) - (b.time_taken_seconds || 0));
      setLeaderboardData(sorted);
      
      if (sorted.length > 0) {
        setLeaderboardStats({
          highestScore: sorted[0].score,
          averageScore: Math.round(sorted.reduce((acc, att) => acc + att.score, 0) / sorted.length * 10) / 10,
          totalParticipants: sorted.length
        });
      } else {
        setLeaderboardStats(null);
      }
      setIsLoadingLeaderboard(false);
    } else {
      const { data, error } = await supabase`,
`      const { data, error } = await supabase`
);
replaceBlock(
`      setIsLoadingLeaderboard(false);
    }`,
`      setIsLoadingLeaderboard(false);`
);

// handleSubmitExam
replaceBlock(
`      if (isDemo) {
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
        const { data, error } = await supabase`,
`        const { data, error } = await supabase`
);
replaceBlock(
`        setViewState('result');
        dispatchEmailNotification(data.score, data.total_questions, data.correct_answers, activeTest);
      }`,
`        setViewState('result');
        dispatchEmailNotification(data.score, data.total_questions, data.correct_answers, activeTest);`
);

// verify leaderboard credentials
replaceBlock(
`      if (isDemo) {
        const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        test = localTests.find(t => t.teacher_email === leaderboardTeacherEmail && t.access_code === leaderboardAccessCode) || null;
      } else {
        const { data: testData, error: testErr } = await supabase`,
`        const { data: testData, error: testErr } = await supabase`
);
replaceBlock(
`        if (testErr) throw testErr;
        test = testData;
      }`,
`        if (testErr) throw testErr;
        test = testData;`
);

// 5. Cleanup `isDemo` from dependency arrays
c = c.replace(/, isDemo\]/g, "]");
c = c.replace(/\[isDemo, /g, "[");

// 6. Delete localhost CORS check
c = c.replace(/if\s*\(\s*window\.location\.hostname\s*!==\s*'localhost'\s*\)\s*\{\s*\n\s*throw\s*new\s*Error\('Skipping\s*local\s*Spring\s*Boot\s*fetch\s*in\s*production\s*to\s*prevent\s*CORS\s*error'\);\s*\n\s*\}/g, "");

fs.writeFileSync(p, c);
console.log('StudentPortal cleanup complete');

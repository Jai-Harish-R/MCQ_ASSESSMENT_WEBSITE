const fs = require('fs');

let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Remove isDemo from handleSubmitExam
const submitTarget = `      if (isDemo) {
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
      } else {`;

c = c.replace(submitTarget, "");

c = c.replace(
  `        setViewState('result');
        dispatchEmailNotification(data.score, data.total_questions, data.correct_answers, activeTest);
      }`,
  `        setViewState('result');
        dispatchEmailNotification(data.score, data.total_questions, data.correct_answers, activeTest);`
);

// 2. Remove isDemo from handleVerifyLeaderboard
const verifyLdTarget = `      if (isDemo) {
        const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        test = localTests.find(t => t.teacher_email === leaderboardTeacherEmail && t.access_code === leaderboardAccessCode) || null;
      } else {`;
c = c.replace(verifyLdTarget, "");

c = c.replace(
  `        if (testErr) throw testErr;
        test = testData;
      }`,
  `        if (testErr) throw testErr;
        test = testData;`
);

// 3. Force-remove the CORS block in dispatchEmailNotification
c = c.replace(/if\s*\(\s*window\.location\.hostname\s*!==\s*'localhost'\s*\)\s*\{\s*throw\s*new\s*Error\('Skipping\s*local\s*Spring\s*Boot\s*fetch\s*in\s*production\s*to\s*prevent\s*CORS\s*error'\);\s*\}/g, "");

fs.writeFileSync(p, c);
console.log('StudentPortal.tsx (part 2) demo mode removed.');

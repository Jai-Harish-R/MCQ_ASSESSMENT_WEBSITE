const fs = require('fs');

let content = fs.readFileSync('src/components/StudentPortal.tsx', 'utf8');

// Update Test interface
content = content.replace(
  "  created_at?: string;\n}",
  "  pass_percentage?: number;\n  max_attempts?: number;\n  created_at?: string;\n}"
);

// Update logic in handleEnterTest to pull all attempts and calculate if they can take the test
const handleEnterTestTarget = `        if (test) {
          const { data: attemptData, error: attemptErr } = await supabase
            .from('test_attempts')
            .select('*')
            .eq('test_id', test.id)
            .eq('student_id', user.id)
            .maybeSingle();

          if (attemptErr) throw attemptErr;
          existingAttempt = attemptData;
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
          setErrorMsg(\`Already Submitted: You completed this exam on \${new Date(existingAttempt.completed_at).toLocaleDateString()}. Score: \${existingAttempt.score}/\${existingAttempt.total_questions}. Ask your educator for a retake authorization if you faced network issues.\`);
          setLoading(false);
          return;
        } else {
          alert("Retake Authorized: Your teacher has authorized a retry due to technical issues. Your previous score will be updated.");
        }
      }`;

const handleEnterTestReplace = `        let studentPreviousAttempts: any[] = [];
        if (test) {
          const { data: attemptData, error: attemptErr } = await supabase
            .from('test_attempts')
            .select('*')
            .eq('test_id', test.id)
            .eq('student_id', user.id)
            .order('completed_at', { ascending: false });

          if (attemptErr) throw attemptErr;
          studentPreviousAttempts = attemptData || [];
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

      // Max Attempts check
      if (studentPreviousAttempts.length > 0) {
        const latestAttempt = studentPreviousAttempts[0];
        const maxAttempts = test.max_attempts || 3;
        
        if (latestAttempt.allowed_retry) {
           alert("Retake Authorized: Your educator has authorized an extra retry.");
        } else if (studentPreviousAttempts.length >= maxAttempts) {
          setErrorMsg(\`Limit Reached: You have completed \${studentPreviousAttempts.length} out of \${maxAttempts} allowed attempts. Ask your educator for a retake authorization if you need another attempt.\`);
          setLoading(false);
          return;
        } else {
           alert(\`Attempt \${studentPreviousAttempts.length + 1} of \${maxAttempts}: You have \${maxAttempts - studentPreviousAttempts.length} attempts remaining.\`);
        }
      }`;

content = content.replace(handleEnterTestTarget, handleEnterTestReplace);

// Update logic in Leaderboard and Recent Attempts where Pass/Fail is hardcoded to >= 50, now using pass_percentage
content = content.replace(
  "const pct = Math.round((attempt.score / attempt.total_questions) * 100);\n                      \n                      let Icon = FileText;",
  "const pct = Math.round((attempt.score / attempt.total_questions) * 100);\n                      const testDetails = availableTests.find(t => t.id === attempt.test_id);\n                      const passThreshold = testDetails?.pass_percentage || 80;\n                      const isPassing = pct >= passThreshold;\n                      \n                      let Icon = FileText;"
);

content = content.replace(
  "let scoreColor = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';",
  "let scoreColor = isPassing ? '#16a34a' : '#dc2626';"
);

// We need to fix the second place where pass/fail logic might be used: "let scoreColor = pct >= 70" is also used in Review Past Attempt modal? Or leaderboard?
// The file has multiple \`let scoreColor = pct >= 70\`. Let's just fix the first one (Recent Attempts).
// Let's do a more robust string replacement for the pass/fail color in StudentPortal

fs.writeFileSync('src/components/StudentPortal.tsx', content);
console.log('StudentPortal updated successfully.');

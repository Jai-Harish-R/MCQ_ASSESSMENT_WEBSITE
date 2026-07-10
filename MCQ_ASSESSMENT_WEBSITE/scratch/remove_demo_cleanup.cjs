const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip simple `if (isDemo) return;`
  content = content.replace(/if\s*\(\s*isDemo\s*\)\s*return;/g, '');
  content = content.replace(/if\s*\(\s*isDemo\s*\|\|\s*!leaderboardSelectedTestId\)\s*return;/g, 'if (!leaderboardSelectedTestId) return;');

  // Now, strip `if (isDemo) { ... } else { ... }` blocks.
  // Since blocks can contain nested braces, we must be careful.
  // Actually, let's just find the exact occurrences manually or write targeted replacements for each line number error we got.
  
  fs.writeFileSync(filePath, content);
}

// StudentPortal.tsx
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/if\s*\(\s*isDemo\s*\)\s*return;/g, '');
c = c.replace(/if\s*\(\s*isDemo\s*\|\|\s*!leaderboardSelectedTestId\)\s*return;/g, 'if (!leaderboardSelectedTestId) return;');

const loadPortalTarget = `    if (isDemo) {
      const localAttempts: Attempt[] = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
      const myAtt = localAttempts.filter(att => att.student_email.toLowerCase() === user.email.toLowerCase());
      setMyAttempts(myAtt.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()));
      
      const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
      setAvailableTests(localTests);
      setIsLoadingData(false);
    } else {`;
c = c.replace(loadPortalTarget, "");

const verifyTarget = `      if (isDemo) {
        const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        const t = localTests.find(x => x.access_code === code);
        if (!t) throw new Error('Invalid Test PIN or Test Not Found.');
        testData = t;
      } else {`;
c = c.replace(verifyTarget, "");

const checkAllowedTarget = `      if (isDemo) {
        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        existing = localAttempts.find((a: any) => a.test_id === testData.id && a.student_email.toLowerCase() === user.email.toLowerCase());
      } else {`;
c = c.replace(checkAllowedTarget, "");

const lbTarget = `    if (isDemo) {
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
    } else {`;
c = c.replace(lbTarget, "");

const verifyLdTarget = `      if (isDemo) {
        const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        test = localTests.find(t => t.teacher_email === leaderboardTeacherEmail && t.access_code === leaderboardAccessCode) || null;
      } else {`;
c = c.replace(verifyLdTarget, "");

fs.writeFileSync(p, c);

// TeacherDashboard.tsx
let t = 'src/components/TeacherDashboard.tsx';
let tc = fs.readFileSync(t, 'utf8');

tc = tc.replace(/if\s*\(\s*isDemo\s*\)\s*return;/g, '');

const tLoadTarget = `      if (isDemo) {
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
      } else {`;
tc = tc.replace(tLoadTarget, "");

fs.writeFileSync(t, tc);

// Remove the `} else {` closures by looking for empty else braces, or just doing it with regex.
// Let's do it manually via regex: \s*\}\s*else\s*\{\s* \n
// Actually, I already removed the if (isDemo) { ... } else { parts, leaving the else { contents bare. I just need to remove the closing } of the else block.
// Wait! If I just removed the `if (isDemo) { ... } else {`, the closing `}` still exists!
// It will look like:
//        setTests(testsData || []);
//        ...
//      }
// Let's run a script that counts '{' and '}' to fix it, or just use regex to remove `}` right before `catch`.
// E.g., `      }\n    } catch` -> `    } catch`

const cleanUpBraces = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/      \}\n    \} catch \(/g, '    } catch (');
  content = content.replace(/        \}\n      \}\n    \} catch \(/g, '      }\n    } catch ('); // deeper nesting
  
  // Also clean up trailing braces for void functions
  content = content.replace(/      \}\n    \};\n/g, '    };\n');
  content = content.replace(/        \}\n      \};\n/g, '      };\n');
  fs.writeFileSync(file, content);
};

cleanUpBraces(p);
cleanUpBraces(t);

console.log('Cleanup script executed.');

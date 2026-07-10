const fs = require('fs');

let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Remove the entire seedDemoData function
const seedStart = c.indexOf('// Demo Data Seeder to match the screenshots exactly');
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

// 3. Remove all if (isDemo) { ... } else { blocks in StudentPortal
// loadPortalData
const loadPortalTarget = `    if (isDemo) {
      seedDemoData();
      const localAttempts: Attempt[] = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
      const myAtt = localAttempts.filter(att => att.student_email.toLowerCase() === user.email.toLowerCase());
      setMyAttempts(myAtt.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()));
      
      const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
      setAvailableTests(localTests);
      setIsLoadingData(false);
    } else {`;
c = c.replace(loadPortalTarget, "");

// find matching brace for loadPortalData else block
c = c.replace(
  `      setIsLoadingData(false);
    }`,
  `      setIsLoadingData(false);`
);

// handleVerifyAccessCode
const verifyTarget = `      if (isDemo) {
        const localTests: Test[] = JSON.parse(localStorage.getItem('demo_tests') || '[]');
        const t = localTests.find(x => x.access_code === code);
        if (!t) throw new Error('Invalid Test PIN or Test Not Found.');
        testData = t;
      } else {`;
c = c.replace(verifyTarget, "");

// matching brace for verify else block
c = c.replace(
  `        if (fetchErr) throw fetchErr;
        testData = data;
      }`,
  `        if (fetchErr) throw fetchErr;
        testData = data;`
);

// check allowed emails inside verify
const allowedTarget = `      if (isDemo) {
        const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');
        existing = localAttempts.find((a: any) => a.test_id === testData.id && a.student_email.toLowerCase() === user.email.toLowerCase());
      } else {`;
c = c.replace(allowedTarget, "");

c = c.replace(
  `        if (attErr && attErr.code !== 'PGRST116') throw attErr;
        existing = attData;
      }`,
  `        if (attErr && attErr.code !== 'PGRST116') throw attErr;
        existing = attData;`
);

// fetchLeaderboardForTest
const fetchLdTarget = `    if (isDemo) {
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
c = c.replace(fetchLdTarget, "");

c = c.replace(
  `      setIsLoadingLeaderboard(false);
    }`,
  `      setIsLoadingLeaderboard(false);`
);

// remove isDemo from useEffect dependency arrays
c = c.replace(/, isDemo\]/g, "]");
c = c.replace(/isDemo, /g, "");

// handleSubmitTest (the massive one)
const submitStart = c.indexOf('if (isDemo) {');
const submitElse = c.indexOf('} else {', submitStart);
// Actually, this is tricky. Let's do it via regex or custom script.
fs.writeFileSync(p, c);
console.log('StudentPortal.tsx (part 1) demo mode removed.');

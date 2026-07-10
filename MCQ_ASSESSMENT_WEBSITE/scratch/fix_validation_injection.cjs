const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// Inject validation right after the questions parsing block
const target = `        if (test && typeof test.questions === 'string') {
          try {
            test.questions = JSON.parse(test.questions);
          } catch (e) {
            console.error('Failed to parse questions', e);
          }
        }`;

const replacement = `        if (test && typeof test.questions === 'string') {
          try {
            test.questions = JSON.parse(test.questions);
          } catch (e) {
            console.error('Failed to parse questions', e);
          }
        }
        
        // Strict Email Validation logic
        if (test && test.allowed_emails !== null && test.allowed_emails !== undefined) {
          const isAllowed = test.allowed_emails.some((e: string) => e.toLowerCase() === user.email.toLowerCase());
          if (!isAllowed) {
            setErrorMsg('Access Denied: Your email address is not authorized to take this test.');
            setLoading(false);
            return;
          }
        }`;

if (!c.includes('Strict Email Validation logic')) {
  c = c.replace(target, replacement);
  fs.writeFileSync(p, c);
  console.log('Successfully injected StudentPortal validation block for Supabase tests');
} else {
  console.log('Validation already present.');
}

// Inject for demo mode tests
const demoTarget = `        if (test) {
          const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');`;
const demoReplacement = `        if (test) {
          // Strict Email Validation logic (Demo mode)
          if (test.allowed_emails !== null && test.allowed_emails !== undefined) {
            const isAllowed = test.allowed_emails.some((e: string) => e.toLowerCase() === user.email.toLowerCase());
            if (!isAllowed) {
              setErrorMsg('Access Denied: Your email address is not authorized to take this test.');
              setLoading(false);
              return;
            }
          }
          const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');`;
if (!c.includes('Strict Email Validation logic (Demo mode)')) {
  c = c.replace(demoTarget, demoReplacement);
  fs.writeFileSync(p, c);
  console.log('Successfully injected StudentPortal validation block for Demo tests');
}

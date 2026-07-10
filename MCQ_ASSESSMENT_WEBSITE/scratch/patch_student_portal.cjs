const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Update Test interface
const interfaceTarget = `  type?: 'test' | 'assignment' | 'quiz' | 'live_exam';
  created_at?: string;
}`;
const interfaceReplacement = `  type?: 'test' | 'assignment' | 'quiz' | 'live_exam';
  created_at?: string;
  allowed_emails?: string[] | null;
}`;
c = c.replace(interfaceTarget, interfaceReplacement);

// 2. Add validation logic inside join logic (after parsing questions)
const validationTarget = `        if (test && typeof test.questions === 'string') {
          try {
            test.questions = JSON.parse(test.questions);
          } catch (e) {
            console.error('Failed to parse questions', e);
          }
        }`;
const validationReplacement = `        if (test && typeof test.questions === 'string') {
          try {
            test.questions = JSON.parse(test.questions);
          } catch (e) {
            console.error('Failed to parse questions', e);
          }
        }
        
        // Validation for allowed emails
        if (test && test.allowed_emails && test.allowed_emails.length > 0) {
          if (!test.allowed_emails.includes(user.email)) {
            setErrorMsg('Access Denied: Your email address is not authorized to take this test.');
            setLoading(false);
            return;
          }
        }`;
c = c.replace(validationTarget, validationReplacement);

// Do the same for demo tests logic
const demoTarget = `        if (test) {
          const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');`;
const demoReplacement = `        if (test) {
          if (test.allowed_emails && test.allowed_emails.length > 0) {
            if (!test.allowed_emails.includes(user.email)) {
              setErrorMsg('Access Denied: Your email address is not authorized to take this test.');
              setLoading(false);
              return;
            }
          }
          const localAttempts = JSON.parse(localStorage.getItem('demo_attempts') || '[]');`;
c = c.replace(demoTarget, demoReplacement);

fs.writeFileSync(p, c);
console.log('StudentPortal patched successfully');

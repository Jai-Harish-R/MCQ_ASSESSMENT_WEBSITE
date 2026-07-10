const fs = require('fs');

// --- Teacher Dashboard Fix ---
let pT = 'src/components/TeacherDashboard.tsx';
let cT = fs.readFileSync(pT, 'utf8');

const tTarget = `allowed_emails: (strictValidation && allowedEmailsInput.trim()) ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : null`;
const tReplace = `allowed_emails: strictValidation ? (allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : []) : null`;

cT = cT.replace(new RegExp(tTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), tReplace);
fs.writeFileSync(pT, cT);

// --- Student Portal Fix ---
let pS = 'src/components/StudentPortal.tsx';
let cS = fs.readFileSync(pS, 'utf8');

// Fix CORS error by skipping localhost fetch if not on localhost
const fetchTarget = `const response = await fetch('http://localhost:8080/api/test/evaluate', {`;
const fetchReplace = `if (window.location.hostname !== 'localhost') {
        throw new Error('Skipping local Spring Boot fetch in production to prevent CORS error');
      }
      const response = await fetch('http://localhost:8080/api/test/evaluate', {`;
cS = cS.replace(fetchTarget, fetchReplace);

// Fix Email Validation logic
const sTarget = `if (test && test.allowed_emails && test.allowed_emails.length > 0) {`;
const sReplace = `if (test && test.allowed_emails !== null && test.allowed_emails !== undefined) {`;
cS = cS.replace(new RegExp(sTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), sReplace);

fs.writeFileSync(pS, cS);

console.log('Fixed Strict Validation logic and CORS error');

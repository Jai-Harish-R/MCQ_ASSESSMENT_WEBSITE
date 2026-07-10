const fs = require('fs');

let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

const target1 = `      if (window.location.hostname !== 'localhost') {
        throw new Error('Skipping local Spring Boot fetch in production to prevent CORS error');
      }`;
c = c.replace(target1, "");

const target2 = `throw new Error('Spring Boot returned error code: ' + response.status);`;
const replace2 = `throw new Error('Serverless Email API returned error code: ' + response.status);`;
c = c.replace(target2, replace2);

const target3 = `console.warn("Spring Boot Mail offline, launching Local Mail Sandbox simulator. Details:", err.message);`;
const replace3 = `console.warn("Email API offline, launching Local Mail Sandbox simulator. Details:", err.message);`;
c = c.replace(target3, replace3);

const target4 = `Connecting to SMTP Mail Server (Spring Mail)... [FAILED]`;
const replace4 = `Connecting to Serverless Email API... [FAILED]`;
c = c.replace(target4, replace4);

const target5 = `{emailStatus === 'fallback' && <div style={{ color: 'var(--color-warning)', fontSize: '13px', fontWeight: '500' }}>Spring Mail offline. Sandbox report rendered below.</div>}`;
const replace5 = `{emailStatus === 'fallback' && <div style={{ color: 'var(--color-warning)', fontSize: '13px', fontWeight: '500' }}>Email API offline. Sandbox report rendered below.</div>}`;
c = c.replace(target5, replace5);

fs.writeFileSync(p, c);
console.log('StudentPortal.tsx email text fixed.');

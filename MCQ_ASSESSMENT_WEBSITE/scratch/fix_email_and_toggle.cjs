const fs = require('fs');

// 1. Fix the email
let p1 = 'src/components/StudentPortal.tsx';
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace('From: CodersFun <no-reply@codersfun.com>', 'From: EduVerify Pro <jaiharishceoa@gmail.com>');
fs.writeFileSync(p1, c1);
console.log('Fixed email from address');

// 2. Fix the toggle UI
let p2 = 'src/components/TeacherDashboard.tsx';
let c2 = fs.readFileSync(p2, 'utf8');
const toggleTarget = `<input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={strictValidation} onChange={() => setStrictValidation(!strictValidation)} />`;
const toggleReplace = `<input type="checkbox" style={{ position: 'absolute', opacity: 0, width: 0, height: 0, margin: 0, padding: 0 }} checked={strictValidation} onChange={() => setStrictValidation(!strictValidation)} />`;
c2 = c2.replace(toggleTarget, toggleReplace);
fs.writeFileSync(p2, c2);
console.log('Fixed toggle switch UI');

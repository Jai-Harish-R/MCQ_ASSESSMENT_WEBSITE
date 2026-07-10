const fs = require('fs');

// Fix AuthGateProps
let p1 = 'src/components/AuthGate.tsx';
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace(
  `onAuthSuccess: (user: { id: string; email: string; role: 'teacher' | 'student' }, isDemo: boolean) => void;`,
  `onAuthSuccess: (user: { id: string; email: string; role: 'teacher' | 'student'; user_metadata?: any }, isDemo: boolean) => void;`
);
fs.writeFileSync(p1, c1);

// Fix TeacherDashboardProps
let p2 = 'src/components/TeacherDashboard.tsx';
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace(
  `user_metadata?: { full_name?: string }`,
  `user_metadata?: { full_name?: string; profession?: string }`
);
fs.writeFileSync(p2, c2);

console.log('Fixed typescript errors');

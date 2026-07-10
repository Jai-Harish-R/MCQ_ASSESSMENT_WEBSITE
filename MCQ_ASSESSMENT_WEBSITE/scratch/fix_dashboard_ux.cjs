const fs = require('fs');

let p = 'src/components/TeacherDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Fix the name fallback
c = c.replace(
  "const teacherDisplayName = user.email.toLowerCase().includes('jai') \n    ? 'Jai' \n    : (user.user_metadata?.full_name || user.email.split('@')[0]);",
  "const teacherDisplayName = user.email.toLowerCase().includes('jai') \n    ? 'Jai' \n    : (user.user_metadata?.full_name || 'Educator');"
);

// 2. Redirect to 'exams' (Dashboard Overview) after test creation
c = c.replace(
  "setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);\n        loadData();\n      }\n    } catch",
  "setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);\n        loadData();\n        setActiveTab('exams');\n      }\n    } catch"
);

c = c.replace(
  "setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);\n        loadData();\n      } else {",
  "setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);\n        loadData();\n        setActiveTab('exams');\n      } else {"
);


fs.writeFileSync(p, c);
console.log('TeacherDashboard.tsx UX fixed.');

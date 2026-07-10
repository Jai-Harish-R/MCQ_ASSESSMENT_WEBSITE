const fs = require('fs');

let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// Add helper function after imports
if (!c.includes('const getLocalDateStr')) {
  c = c.replace(
    "interface StudentPortalProps {",
    "const getLocalDateStr = (d: Date | string | number) => {\n  const date = new Date(d);\n  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;\n};\n\ninterface StudentPortalProps {"
  );
}

// 1. Replace currentDateString in calendar builder
c = c.replace(
  "const currentDateString = new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum).toISOString().split('T')[0];",
  "const currentDateString = getLocalDateStr(new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum));"
);
c = c.replace(
  "const currentDateString = new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum).toISOString().split('T')[0];",
  "const currentDateString = getLocalDateStr(new Date(year, isCurrentMonth ? month : (dateNum <= 0 ? month - 1 : month + 1), displayNum));"
);

// 2. Replace dayAttempts filter
c = c.replace(
  "const dayAttempts = myAttempts.filter(att => new Date(att.completed_at).toISOString().split('T')[0] === currentDateString);",
  "const dayAttempts = myAttempts.filter(att => getLocalDateStr(att.completed_at) === currentDateString);"
);
c = c.replace(
  "const dayAttempts = myAttempts.filter(att => new Date(att.completed_at).toISOString().split('T')[0] === currentDateString);",
  "const dayAttempts = myAttempts.filter(att => getLocalDateStr(att.completed_at) === currentDateString);"
);

// 3. Replace selectedDate filters
const selectedDateFilterTarget = "myAttempts.filter(att => new Date(att.completed_at).toISOString().split('T')[0] === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString().split('T')[0])";
const selectedDateFilterReplace = "myAttempts.filter(att => getLocalDateStr(att.completed_at) === getLocalDateStr(selectedDate))";

c = c.split(selectedDateFilterTarget).join(selectedDateFilterReplace);

fs.writeFileSync(p, c);
console.log('StudentPortal date bug fixed.');

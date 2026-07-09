const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/\{studentDisplayName \|\| 'jhgno\.official'\}/g, '{String(studentDisplayName || \\'jhgno.official\\')}');
c = c.replace(/\{myAttempts\.length\}/g, '{String(myAttempts.length)}');
c = c.replace(/\{averageAccuracy(?: \|\| 0)?\}/g, '{String(averageAccuracy || 0)}');
c = c.replace(/\{assessmentsOverview\.total(?: \|\| 0)?\}/g, '{String(assessmentsOverview.total || 0)}');
c = c.replace(/\{averageImprovement(?: >= 0 \? '\+' : '')\}/g, '{averageImprovement >= 0 ? \\'+\\' : \\'\\'}');
c = c.replace(/\{averageImprovement\}%/g, '{String(averageImprovement)}%');
c = c.replace(/\{attempt\.test_title \|\| 'Assessment'\}/g, '{String(attempt.test_title || \\'Assessment\\')}');
c = c.replace(/\{att\.test_title\}/g, '{String(att.test_title)}');
c = c.replace(/\{errorMsg\}/g, '{typeof errorMsg === \\'object\\' ? JSON.stringify(errorMsg) : String(errorMsg)}');
c = c.replace(/\{startDate \? startDate\.toLocaleDateString\(\) : 'Always open'\}/g, '{String(startDate ? startDate.toLocaleDateString() : \\'Always open\\')}');
c = c.replace(/\{test\.title\}/g, '{String(test.title)}');
c = c.replace(/\{test\.duration\}/g, '{String(test.duration)}');
c = c.replace(/\{test\.total_students\}/g, '{String(test.total_students)}');

fs.writeFileSync(p, c);
console.log('Fixed bindings in StudentPortal');

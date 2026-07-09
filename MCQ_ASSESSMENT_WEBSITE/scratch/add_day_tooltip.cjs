const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/onClick=\{\(\) => \{\s*if \(isCurrentMonth\) \{\s*setSelectedDate\(new Date\(year, month, displayNum\)\);\s*\}\s*\}\}\s*style=\{\{/g, 
\`onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(new Date(year, month, displayNum));
                            }
                          }}
                          title={dayAttempts.length > 0 ? dayAttempts.map(a => a.test_title || 'Unknown Test').join(', ') : undefined}
                          style={{\`);

fs.writeFileSync(p, c);
console.log('Replaced day tooltip');

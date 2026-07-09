const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

const t1 = `                          key={i}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(new Date(year, month, displayNum));
                            }
                          }}
                          style={{`;

const r1 = `                          key={i}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(new Date(year, month, displayNum));
                            }
                          }}
                          title={dayAttempts.length > 0 ? dayAttempts.map(a => a.test_title || 'Unknown Test').join(', ') : undefined}
                          style={{`;

c = c.replace(t1.replace(/\\n/g, '\\r\\n'), r1.replace(/\\n/g, '\\r\\n')); // try CRLF
c = c.replace(t1, r1); // try LF


const t2 = `onClick={() => handleReviewPastAttempt(attempt)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.1s' }}`;

const r2 = `onClick={() => handleReviewPastAttempt(attempt)} title={\`Score: \${attempt.score}/\${attempt.total_questions} (\${pct}%) - Click to review\`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.1s' }}`;

c = c.replace(t2, r2);

fs.writeFileSync(p, c);
console.log('Done');

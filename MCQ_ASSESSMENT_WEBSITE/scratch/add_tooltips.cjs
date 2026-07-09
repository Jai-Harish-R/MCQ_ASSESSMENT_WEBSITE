const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// For the calendar day wrapper, add title attribute.
// The wrapper is:
/*
                        <div
                          key={i}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(new Date(year, month, displayNum));
                            }
                          }}
                          style={{ 
*/
// I will replace it to include title={dayAttempts.length > 0 ? dayAttempts.map(a => a.test_title || 'Unknown').join(', ') : undefined}

const dayWrapperTarget = `                        <div
                          key={i}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(new Date(year, month, displayNum));
                            }
                          }}
                          style={{ `;
                          
const dayWrapperReplacement = `                        <div
                          key={i}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(new Date(year, month, displayNum));
                            }
                          }}
                          title={dayAttempts.length > 0 ? dayAttempts.map(a => a.test_title || 'Unknown').join(', ') : undefined}
                          style={{ `;

c = c.replace(dayWrapperTarget, dayWrapperReplacement);

// For the exam list on the right side, add title attribute
// The wrapper is:
/*
                        return (
                          <div key={attempt.id} onClick={() => handleReviewPastAttempt(attempt)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.1s' }}>
*/

const examItemTarget = `                        return (
                          <div key={attempt.id} onClick={() => handleReviewPastAttempt(attempt)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.1s' }}>`;

const examItemReplacement = `                        return (
                          <div key={attempt.id} 
                               title={\`Score: \${attempt.score}/\${attempt.total_questions} (\${pct}%) - Click to review\`}
                               onClick={() => handleReviewPastAttempt(attempt)} 
                               style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.1s' }}>`;

c = c.replace(examItemTarget, examItemReplacement);

fs.writeFileSync(p, c);
console.log('Tooltip titles added');

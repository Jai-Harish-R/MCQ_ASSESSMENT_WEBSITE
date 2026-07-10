const fs = require('fs');

let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// Fix the missed .toISOString() mapping block
const stragglerTarget = `.filter(att => new Date(att.completed_at).toISOString().split('T')[0] === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString().split('T')[0])`;
const stragglerReplace = `.filter(att => getLocalDateStr(att.completed_at) === getLocalDateStr(selectedDate))`;
c = c.replace(stragglerTarget, stragglerReplace);

// Remove the legend below the calendar
const legendTarget = `                    {/* Calendar Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div> Test
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ea580c' }}></div> Assignment
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }}></div> Quiz
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div> Result
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div> Live Exam
                      </div>
                    </div>`;

c = c.replace(legendTarget, "");

fs.writeFileSync(p, c);
console.log('StudentPortal UX bugs fixed.');

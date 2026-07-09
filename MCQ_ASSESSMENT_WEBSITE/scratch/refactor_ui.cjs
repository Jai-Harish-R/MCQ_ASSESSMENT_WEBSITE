const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// TASK 1: Calendar Enhancements

// A: Update calendar day markers from circles to rounded squares
// Current dot: <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></div>
const dotTarget = `style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}`;
const dotReplacement = `style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: color }}`;
c = c.replace(dotTarget, dotReplacement);


// B: Remove Legend
// We will find the legend block which starts with {/* Legend */} and ends before {/* Charts Row */}
// There's a legend below the calendar.
const legendTarget = `                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '24px', fontSize: '12px', fontWeight: '600', color: '#475569', flexWrap: 'wrap' }}>
                    {Object.entries(testTitleColors).map(([title, color], idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {/* @ts-ignore */}
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></div>
                        </div>
                        <span>{title}</span>
                      </div>
                    ))}
                  </div>`;
c = c.replace(legendTarget, '');


// TASK 2: Right Panel Updates (Selected Date Tests)
// Replace the circular icons with solid rounded squares
// Target block:
/*
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={24} />
                              </div>
*/
const rightPanelIconTarget = `                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={24} />
                              </div>`;
// In the right panel, we just use the generated testTitleColors or the default test type color.
// Wait, the testTitleColors is what we should use for the solid color.
// But we don't have access to testTitleColors in all places without @ts-ignore? We do!
const rightPanelIconReplacement = `                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              {/* @ts-ignore */}
                              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: testTitleColors[attempt.test_title || 'Unknown Test'] || color, flexShrink: 0 }}>
                              </div>`;
c = c.replace(rightPanelIconTarget, rightPanelIconReplacement);


// TASK 3: Recent Attempts Section Updates
// The Recent Attempts block has a similar structure.
/*
                          {/* Left: Icon & Title *\/}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 30%' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={20} />
                            </div>
*/
const recentAttemptsIconTarget = `                          {/* Left: Icon & Title */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 30%' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={20} />
                            </div>`;
const recentAttemptsIconReplacement = `                          {/* Left: Icon & Title */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 30%' }}>
                            {/* @ts-ignore */}
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: testTitleColors[attempt.test_title || 'Unknown Test'] || color, flexShrink: 0 }}>
                            </div>`;
c = c.replace(recentAttemptsIconTarget, recentAttemptsIconReplacement);


fs.writeFileSync(p, c);
console.log('UI refactoring script executed.');

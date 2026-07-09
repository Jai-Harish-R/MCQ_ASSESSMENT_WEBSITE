const fs = require('fs');
const path = require('path');
const p = path.resolve('src/components/StudentPortal.tsx');
let c = fs.readFileSync(p, 'utf8');

// The color palette
const paletteDef = `
  // Generate distinct colors based on test titles
  const testTitleColors = React.useMemo(() => {
    const palette = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#dc2626', '#ea580c', '#d97706',
      '#ca8a04', '#65a30d', '#16a34a', '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', '#c026d3'
    ];
    const uniqueTitles = Array.from(new Set(myAttempts.map(a => a.test_title || 'Unknown Test')));
    const colorMap: Record<string, string> = {};
    uniqueTitles.forEach((title, i) => {
      colorMap[title] = palette[i % palette.length];
    });
    return colorMap;
  }, [myAttempts]);
`;

// Insert the paletteDef just before activeTab === 'review_attempts' check
c = c.replace(/\{\/\* TAB 3: REVIEW ATTEMPTS \(CALENDAR GRID INTEGRATION\) \*\/\}/g, paletteDef + '\n          {/* TAB 3: REVIEW ATTEMPTS (CALENDAR GRID INTEGRATION) */}');

// Replace the render dots logic
const dotsTarget = `                          {/* Render Dots */}
                          {dayAttempts.length > 0 && (
                            <div style={{ position: 'absolute', bottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', width: '80%' }}>
                              {dayAttempts.slice(0, 3).map((att, idx) => {
                                let color = '#3b82f6'; // default test
                                if (att.test_type === 'quiz') color = '#a855f7';
                                if (att.test_type === 'assignment') color = '#ea580c';
                                if (att.test_type === 'live_exam') color = '#ef4444';
                                return <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></div>;
                              })}
                            </div>
                          )}`;
const dotsReplacement = `                          {/* Render Dots */}
                          {dayAttempts.length > 0 && (
                            <div style={{ position: 'absolute', bottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', width: '80%' }}>
                              {dayAttempts.slice(0, 3).map((att, idx) => {
                                const color = testTitleColors[att.test_title || 'Unknown Test'] || '#3b82f6';
                                return <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></div>;
                              })}
                            </div>
                          )}`;
c = c.replace(dotsTarget, dotsReplacement);

// Replace the legend
const legendTarget = `                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '24px', fontSize: '12px', fontWeight: '600', color: '#475569', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                      </div>
                      <span>Test</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }}></div>
                      </div>
                      <span>Assignment</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a855f7' }}></div>
                      </div>
                      <span>Quiz</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                      </div>
                      <span>Result</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                      </div>
                      <span>Live Exam</span>
                    </div>
                  </div>`;
const legendReplacement = `                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '24px', fontSize: '12px', fontWeight: '600', color: '#475569', flexWrap: 'wrap' }}>
                    {Object.entries(testTitleColors).map(([title, color], idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></div>
                        </div>
                        <span>{title}</span>
                      </div>
                    ))}
                  </div>`;
c = c.replace(legendTarget, legendReplacement);

fs.writeFileSync(p, c);
console.log('Task 4 applied');

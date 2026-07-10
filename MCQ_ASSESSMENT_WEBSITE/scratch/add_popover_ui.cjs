const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

const target = `                      return (
                        <div
                          key={i}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(new Date(year, month, displayNum));
                            }
                          }}
                          title={dayAttempts.length > 0 ? dayAttempts.map(a => a.test_title || 'Unknown Test').join(', ') : undefined}
                          style={{ 
                            position: 'relative', height: '64px', fontSize: '14px', fontWeight: '700', 
                            color: isCurrentMonth ? (isSelected ? '#ea580c' : '#0f172a') : '#cbd5e1',
                            backgroundColor: isSelected ? '#fff7ed' : 'transparent',
                            borderRadius: '12px', cursor: isCurrentMonth ? 'pointer' : 'default',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px'
                          }}
                        >
                          {displayNum}
                          
                          {/* Render Dots */}
                          {dayAttempts.length > 0 && (
                            <div style={{ position: 'absolute', bottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', width: '80%' }}>
                              {dayAttempts.slice(0, 3).map((att, idx) => {
                                let color = '#3b82f6'; // default test
                                if (att.test_type === 'quiz') color = '#a855f7';
                                if (att.test_type === 'assignment') color = '#ea580c';
                                if (att.test_type === 'live_exam') color = '#ef4444';
                                return <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: color }}></div>;
                              })}
                            </div>
                          )}
                        </div>
                      );`;

const replacement = `                      const groupedAttempts = dayAttempts.reduce((acc, att) => {
                        const title = att.test_title || 'Unknown Test';
                        if (!acc[title]) acc[title] = [];
                        acc[title].push(att);
                        return acc;
                      }, {} as Record<string, typeof dayAttempts>);

                      return (
                        <div
                          key={i}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(new Date(year, month, displayNum));
                            }
                          }}
                          onMouseEnter={() => handleHoverEnter('date', currentDateString)}
                          onMouseLeave={handleHoverLeave}
                          style={{ 
                            position: 'relative', height: '64px', fontSize: '14px', fontWeight: '700', 
                            color: isCurrentMonth ? (isSelected ? '#ea580c' : '#0f172a') : '#cbd5e1',
                            backgroundColor: isSelected ? '#fff7ed' : 'transparent',
                            borderRadius: '12px', cursor: isCurrentMonth ? 'pointer' : 'default',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px'
                          }}
                        >
                          {displayNum}
                          
                          {/* Render Dots */}
                          {dayAttempts.length > 0 && (
                            <div style={{ position: 'absolute', bottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', width: '80%' }}>
                              {Object.entries(groupedAttempts).slice(0, 3).map(([title, _], idx) => {
                                // @ts-ignore
                                const tColor = testTitleColors[title] || '#3b82f6';
                                return <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: tColor }}></div>;
                              })}
                            </div>
                          )}

                          {/* Hover Popover 1: Tests */}
                          {hoveredDateStr === currentDateString && dayAttempts.length > 0 && (
                            <div 
                              onMouseEnter={() => handleHoverEnter('date', currentDateString)}
                              onMouseLeave={handleHoverLeave}
                              style={{ position: 'absolute', top: '-10px', left: '100%', marginLeft: '10px', zIndex: 50, backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '16px', width: '260px', border: '1px solid #f1f5f9', cursor: 'default', textAlign: 'left' }}>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                                {displayNum} {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(groupedAttempts).map(([title, attemptsForTest]) => {
                                  const testId = title + '-' + currentDateString;
                                  // @ts-ignore
                                  const tColor = testTitleColors[title] || '#3b82f6';
                                  return (
                                    <div key={testId} 
                                         onMouseEnter={() => handleHoverEnter('test', testId)}
                                         onMouseLeave={handleHoverLeave}
                                         style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', backgroundColor: hoveredTestId === testId ? '#f8fafc' : 'transparent', position: 'relative' }}>
                                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: tColor, flexShrink: 0 }}></div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{attemptsForTest.length} Attempts</div>
                                      </div>
                                      
                                      {/* Hover Popover 2: Attempts */}
                                      {hoveredTestId === testId && (
                                        <div 
                                          onMouseEnter={() => handleHoverEnter('test', testId)}
                                          onMouseLeave={handleHoverLeave}
                                          style={{ position: 'absolute', top: '-20px', left: '100%', marginLeft: '10px', zIndex: 51, backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '16px', width: '240px', border: '1px solid #f1f5f9' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                             <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: tColor, flexShrink: 0 }}></div>
                                             <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                                          </div>
                                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>{attemptsForTest.length} Attempts</div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {attemptsForTest.map((att, idx) => {
                                              const attPct = Math.round((att.score / att.total_questions) * 100);
                                              const attScoreColor = attPct >= 70 ? '#16a34a' : attPct >= 40 ? '#d97706' : '#dc2626';
                                              return (
                                                <div key={att.id} 
                                                     onMouseEnter={() => handleHoverEnter('attempt', att.id)}
                                                     onMouseLeave={handleHoverLeave}
                                                     style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '8px', backgroundColor: hoveredAttemptId === att.id ? '#f8fafc' : 'transparent', position: 'relative' }}>
                                                  <div>
                                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Attempt {idx + 1}</div>
                                                    <div style={{ fontSize: '10px', color: '#64748b' }}>{new Date(att.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                  </div>
                                                  <div style={{ fontSize: '12px', fontWeight: '800', color: attScoreColor }}>{attPct}% &gt;</div>
                                                  
                                                  {/* Hover Popover 3: Attempt Details */}
                                                  {hoveredAttemptId === att.id && (
                                                     <div 
                                                      onMouseEnter={() => handleHoverEnter('attempt', att.id)}
                                                      onMouseLeave={handleHoverLeave}
                                                      style={{ position: 'absolute', top: '-40px', left: '100%', marginLeft: '10px', zIndex: 52, backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '20px', width: '220px', border: '1px solid #f1f5f9' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Attempt {idx + 1}</div>
                                                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '12px' }}>{attPct >= 70 ? 'Good Score' : 'Score'}</div>
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>{new Date(att.completed_at).toLocaleString()}</div>
                                                        
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                                                            <span style={{ color: '#475569' }}>Score</span>
                                                            <span style={{ color: attScoreColor, fontWeight: '800' }}>{attPct}%</span>
                                                          </div>
                                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                                                            <span style={{ color: '#475569' }}>Questions</span>
                                                            <span style={{ color: '#0f172a', fontWeight: '800' }}>{att.total_questions}</span>
                                                          </div>
                                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                                                            <span style={{ color: '#475569' }}>Correct</span>
                                                            <span style={{ color: '#16a34a', fontWeight: '800' }}>{att.score}</span>
                                                          </div>
                                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                                                            <span style={{ color: '#475569' }}>Incorrect</span>
                                                            <span style={{ color: '#dc2626', fontWeight: '800' }}>{att.total_questions - att.score}</span>
                                                          </div>
                                                        </div>
                                                        
                                                        <button 
                                                          onClick={(e) => { e.stopPropagation(); handleReviewPastAttempt(att); }}
                                                          style={{ width: '100%', padding: '10px 0', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                                                          View Attempt
                                                        </button>
                                                     </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );`;

c = c.replace(target, replacement);

fs.writeFileSync(p, c);
console.log('UI injected');

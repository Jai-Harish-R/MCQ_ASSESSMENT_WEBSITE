const fs = require('fs');

let p = 'src/components/TeacherDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add missing imports
c = c.replace(
  "Trash2, Users, Award, AlertCircle, BookOpen,",
  "Trash2, Users, Award, AlertCircle, BookOpen, ChevronLeft, ChevronRight, Calendar, FileText,"
);

// 2. Add Calendar State and Helper function
if (!c.includes('const getLocalDateStr')) {
  c = c.replace(
    "interface Question {",
    "const getLocalDateStr = (d: Date | string | number) => {\n  const date = new Date(d);\n  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;\n};\n\ninterface Question {"
  );
}

const stateTarget = `const [selectedLeaderboardTestId, setSelectedLeaderboardTestId] = useState<string>('');`;
const stateReplace = `const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const [selectedLeaderboardTestId, setSelectedLeaderboardTestId] = useState<string>('');`;
c = c.replace(stateTarget, stateReplace);


// 3. Inject the Calendar UI below the Examinee Performance Reports table.
// Find the end of the Dashboard tab.
const dashboardEndTarget = `                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LEADERBOARD */}`;

const dashboardEndReplace = `                  </div>
                )}
              </div>
              
              {/* === TEACHER CALENDAR SECTION === */}
              <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Assessment Calendar</h2>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Keep track of the tests you've conducted.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
                  
                  {/* Left: Calendar Widget */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="header-icon-btn" 
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                          style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button 
                          className="header-icon-btn" 
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                          style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', paddingBottom: '8px' }}>
                          {day}
                        </div>
                      ))}

                      {(() => {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const daysInPrevMonth = new Date(year, month, 0).getDate();
                        
                        const days = [];
                        for (let i = 0; i < firstDay; i++) {
                          days.push({ dateNum: daysInPrevMonth - firstDay + i + 1, isCurrentMonth: false });
                        }
                        for (let i = 1; i <= daysInMonth; i++) {
                          days.push({ dateNum: i, isCurrentMonth: true });
                        }
                        const remaining = 42 - days.length;
                        for (let i = 1; i <= remaining; i++) {
                          days.push({ dateNum: i, isCurrentMonth: false });
                        }

                        return days.map((dayObj, i) => {
                          const displayNum = dayObj.dateNum;
                          const isCurrentMonth = dayObj.isCurrentMonth;
                          const currentDateString = getLocalDateStr(new Date(year, isCurrentMonth ? month : (dayObj.dateNum > 20 && i < 10 ? month - 1 : month + 1), displayNum));
                          
                          // Tests conducted on this day
                          const dayTests = tests.filter(t => getLocalDateStr(t.created_at) === currentDateString);
                          
                          const isSelected = isCurrentMonth && displayNum === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
                          const isToday = currentDateString === getLocalDateStr(new Date());

                          return (
                            <div
                              key={i}
                              onClick={() => {
                                if (isCurrentMonth) setSelectedDate(new Date(year, month, displayNum));
                              }}
                              style={{
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: isSelected ? '700' : '500',
                                color: !isCurrentMonth ? '#cbd5e1' : isSelected ? '#fff' : isToday ? '#3b82f6' : '#334155',
                                backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                cursor: isCurrentMonth ? 'pointer' : 'default',
                                position: 'relative',
                                transition: 'all 0.2s'
                              }}
                            >
                              {displayNum}
                              {dayTests.length > 0 && isCurrentMonth && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '4px',
                                  width: '4px',
                                  height: '4px',
                                  borderRadius: '50%',
                                  backgroundColor: isSelected ? '#fff' : '#f97316' // Orange dot as requested
                                }} />
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Right: Selected Date Tests */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Conducted on {selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div style={{ backgroundColor: '#ffedd5', color: '#ea580c', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                        {tests.filter(t => getLocalDateStr(t.created_at) === getLocalDateStr(selectedDate)).length} Tests
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                      {tests.filter(t => getLocalDateStr(t.created_at) === getLocalDateStr(selectedDate)).map(t => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{t.title}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>PIN: {t.access_code}</div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setSelectedLeaderboardTestId(t.id);
                                setActiveTab('leaderboard');
                              }}
                              style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', fontSize: '12px', fontWeight: '600', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                            >
                              View Leaderboard
                            </button>
                            <button
                              onClick={() => deleteTest(t.id)}
                              style={{ padding: '6px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Delete Test"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {tests.filter(t => getLocalDateStr(t.created_at) === getLocalDateStr(selectedDate)).length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '40px 0' }}>
                          No tests conducted on this date.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEADERBOARD */}`;

c = c.replace(dashboardEndTarget, dashboardEndReplace);

fs.writeFileSync(p, c);
console.log('Teacher Dashboard Calendar added');

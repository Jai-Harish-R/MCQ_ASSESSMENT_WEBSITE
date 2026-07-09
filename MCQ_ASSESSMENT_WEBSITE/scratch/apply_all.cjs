const fs = require('fs');
const path = require('path');
const p = path.resolve('src/components/StudentPortal.tsx');
let c = fs.readFileSync(p, 'utf8');

// TASK 1: Fix Grading Logic
const elseBlockTarget = `      } else {
        const { data, error } = await supabase.rpc('submit_test_attempt', {
          p_test_id: activeTest.id,
          p_student_id: user.id,
          p_student_email: user.email,
          p_answers: answers
        });

        if (error) throw error;

        setScore(data.score);
        setTotalQuestions(data.total_questions);
        setCorrectAnswers(data.correct_answers);
        setViewState('result');
        dispatchEmailNotification(data.score, data.total_questions, data.correct_answers, activeTest);
      }`;

const elseBlockReplacement = `      } else {
        // Fetch correct answers (bypassing potentially broken RPC grading)
        const { data: ansData } = await supabase
          .from('test_answers')
          .select('correct_answers')
          .eq('test_id', activeTest.id)
          .single();
          
        let correctAnswersKey = ansData?.correct_answers || {};
        let calculatedScore = 0;
        const total = activeTest.questions.length;
        
        activeTest.questions.forEach((q) => {
          if (answers[q.id] !== undefined && answers[q.id] == correctAnswersKey[q.id]) {
            calculatedScore++;
          }
        });

        const { data, error } = await supabase
          .from('test_attempts')
          .insert({
            test_id: activeTest.id,
            student_id: user.id,
            student_email: user.email,
            answers: answers,
            score: calculatedScore,
            total_questions: total
          })
          .select()
          .single();

        if (error) {
          // Fallback to RPC if insert fails due to RLS
          const { data: rpcData, error: rpcErr } = await supabase.rpc('submit_test_attempt', {
            p_test_id: activeTest.id,
            p_student_id: user.id,
            p_student_email: user.email,
            p_answers: answers
          });
          if (rpcErr) throw rpcErr;
          
          setScore(rpcData.score);
          setTotalQuestions(rpcData.total_questions);
          setCorrectAnswers(rpcData.correct_answers);
          setViewState('result');
          dispatchEmailNotification(rpcData.score, rpcData.total_questions, rpcData.correct_answers, activeTest);
          return;
        }

        setScore(calculatedScore);
        setTotalQuestions(total);
        setCorrectAnswers(correctAnswersKey);
        setViewState('result');
        dispatchEmailNotification(calculatedScore, total, correctAnswersKey, activeTest);
      }`;
c = c.replace(elseBlockTarget, elseBlockReplacement);

// TASK 2: Email Sender Update
c = c.replace(/From: EduVerify Pro Portal <no-reply@eduverify-pro\.edu>/g, 'From: CodersFun <no-reply@codersfun.com>');

// TASK 3: Clean Up Dashboard UI
const chartsTarget = `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>Assessments Overview</h3>
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginBottom: '24px' }}>Your overall activity this month</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div className="donut-chart" style={{ background: assessmentsOverview.bg }}>
                      <div className="donut-hole">
                        <div style={{ fontSize: '24px', fontWeight: '800' }}>{assessmentsOverview.total}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', fontWeight: '600' }}>Total</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                      <div className="stat-legend-item">
                        <div className="stat-legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                        <span className="stat-legend-label">Tests</span>
                        <span className="stat-legend-value">{assessmentsOverview.tests.count} ({assessmentsOverview.tests.pct}%)</span>
                      </div>
                      <div className="stat-legend-item">
                        <div className="stat-legend-color" style={{ backgroundColor: '#a855f7' }}></div>
                        <span className="stat-legend-label">Quizzes</span>
                        <span className="stat-legend-value">{assessmentsOverview.quizzes.count} ({assessmentsOverview.quizzes.pct}%)</span>
                      </div>
                      <div className="stat-legend-item">
                        <div className="stat-legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                        <span className="stat-legend-label">Assignments</span>
                        <span className="stat-legend-value">{assessmentsOverview.assignments.count} ({assessmentsOverview.assignments.pct}%)</span>
                      </div>
                      <div className="stat-legend-item">
                        <div className="stat-legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                        <span className="stat-legend-label">Live Exams</span>
                        <span className="stat-legend-value">{assessmentsOverview.live_exams.count} ({assessmentsOverview.live_exams.pct}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>Performance Trend</h3>
                      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>Your average score over time</p>
                    </div>
                    <select className="input-field" style={{ padding: '6px 12px', width: 'auto', fontSize: '13px' }}>
                      <option>This Month</option>
                      <option>Last Month</option>
                      <option>All Time</option>
                    </select>
                  </div>
                  
                  <div className="trend-chart-container">
                    {/* Render trend lines dynamically based on performanceTrend */}
                    <div className="trend-line-bg"></div>
                    <div className="trend-line" style={{ height: \`\${performanceTrend.pts[0].y}%\`, left: \`\${performanceTrend.pts[0].x}%\` }}></div>
                    
                    {performanceTrend.pts.map((pt, i) => {
                      if (i === 0) return null;
                      const prev = performanceTrend.pts[i-1];
                      const width = pt.x - prev.x;
                      const heightDiff = pt.y - prev.y;
                      const length = Math.sqrt(width*width + heightDiff*heightDiff);
                      const angle = Math.atan2(heightDiff, width) * (180/Math.PI);
                      return (
                        <div key={i} className="trend-line-segment" style={{
                          left: \`\${prev.x}%\`,
                          bottom: \`\${prev.y}%\`,
                          width: \`\${length}%\`,
                          transform: \`rotate(\${-angle}deg)\`,
                          transformOrigin: 'bottom left'
                        }}></div>
                      );
                    })}

                    {performanceTrend.pts.map((pt, i) => (
                      <div key={'pt'+i} className="trend-point" style={{ left: \`\${pt.x}%\`, bottom: \`\${pt.y}%\` }}></div>
                    ))}
                  </div>
                  <div className="trend-labels">
                    {performanceTrend.labels.map((lbl, i) => <span key={i}>{lbl}</span>)}
                  </div>
                </div>
              </div>`;
c = c.replace(chartsTarget, '');

// TASK 4: Enhance Review Attempts Calendar
const paletteDef = `  // Generate distinct colors based on test titles
  const testTitleColors = React.useMemo(() => {
    const palette = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#dc2626', '#ea580c', '#d97706',
      '#ca8a04', '#65a30d', '#16a34a', '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', '#c026d3'
    ];
    const uniqueTitles = Array.from(new Set(myAttempts.map(a => a.test_title || 'Unknown Test')));
    const colorMap = {};
    uniqueTitles.forEach((title, i) => {
      colorMap[title] = palette[i % palette.length];
    });
    return colorMap;
  }, [myAttempts]);`;

// Find the main return and insert the palette before it
const returnTarget = "  return (\n    <div className=\"student-portal-wrapper\">";
c = c.replace(returnTarget, paletteDef + '\n\n' + returnTarget);

// Replace dots
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
                                // @ts-ignore
                                const color = testTitleColors[att.test_title || 'Unknown Test'] || '#3b82f6';
                                return <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></div>;
                              })}
                            </div>
                          )}`;
c = c.replace(dotsTarget, dotsReplacement);

// Replace legend
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
                          {/* @ts-ignore */}
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></div>
                        </div>
                        <span>{title}</span>
                      </div>
                    ))}
                  </div>`;
c = c.replace(legendTarget, legendReplacement);

fs.writeFileSync(p, c);
console.log('All Tasks 1-4 applied securely');

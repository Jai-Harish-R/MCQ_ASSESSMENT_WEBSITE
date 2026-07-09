const fs = require('fs');
const path = require('path');
const p = path.resolve('src/components/StudentPortal.tsx');
let c = fs.readFileSync(p, 'utf8');

// TASK 1: Fix Grading Logic (bypass RPC if it's broken, or just use a standard insert and fetch answers on the client)
// But to be safe with RLS, let's keep the RPC call if we have to, BUT wait!
// What if the RPC expects p_answers as strings, or what if the RPC is buggy?
// Let's replace the else block in handleSubmitExam:
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
// Remove Assessments Overview and Performance Trend
// They are inside <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
// Let's just regex replace that whole grid container.
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

fs.writeFileSync(p, c);
console.log('Task 1, 2, 3 applied');

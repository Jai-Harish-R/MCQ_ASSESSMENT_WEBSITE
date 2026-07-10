const fs = require('fs');

let content = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');

// 1. Add Test interface properties
content = content.replace(
  "  created_at: string;\n}",
  "  pass_percentage?: number;\n  max_attempts?: number;\n  created_at: string;\n}"
);

// 2. Add State for Advanced Config
content = content.replace(
  "  const [accessEnd, setAccessEnd] = useState('');\n  const [strictValidation, setStrictValidation] = useState(false);\n  const [allowedEmailsInput, setAllowedEmailsInput] = useState('');",
  "  const [accessEnd, setAccessEnd] = useState('');\n  const [strictValidation, setStrictValidation] = useState(false);\n  const [allowedEmailsInput, setAllowedEmailsInput] = useState('');\n\n  // Advanced config state\n  const [advancedConfigEnabled, setAdvancedConfigEnabled] = useState(false);\n  const [passPercentage, setPassPercentage] = useState<number>(80);\n  const [maxAttempts, setMaxAttempts] = useState<number>(3);"
);

// 3. Reset state on publish
content = content.replace(
  "        setTestTitle('');\n        setAccessCode('');\n        setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);\n        loadData();",
  "        setTestTitle('');\n        setAccessCode('');\n        setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, imageUrl: '' }]);\n        setAdvancedConfigEnabled(false);\n        setPassPercentage(80);\n        setMaxAttempts(3);\n        loadData();"
);

// 4. Update the insert query
const insertTarget = `          .insert({
            teacher_id: user.id,
            teacher_email: user.email,
            title: testTitle,
            access_code: accessCode,
            questions: formattedQuestions,
            type: 'test',
            duration: duration,
            total_students: totalStudents,
            access_start: accessStart ? new Date(accessStart).toISOString() : null,
            access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
            allowed_emails: strictValidation ? (allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : []) : null
          })`;

const insertReplace = `          .insert({
            teacher_id: user.id,
            teacher_email: user.email,
            title: testTitle,
            access_code: accessCode,
            questions: formattedQuestions,
            type: 'test',
            duration: duration,
            total_students: totalStudents,
            access_start: accessStart ? new Date(accessStart).toISOString() : null,
            access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
            allowed_emails: strictValidation ? (allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : []) : null,
            pass_percentage: advancedConfigEnabled ? passPercentage : 80,
            max_attempts: advancedConfigEnabled ? maxAttempts : 3
          })`;

content = content.replace(insertTarget, insertReplace);

// 5. Add Advanced Configuration UI
const uiTarget = `              {/* Add questions button */}`;

const uiReplace = `              {/* Advanced Configurations */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Advanced Rules</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Set custom pass percentage and maximum attempt limits.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: advancedConfigEnabled ? '#3b82f6' : '#cbd5e1', borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => setAdvancedConfigEnabled(!advancedConfigEnabled)}>
                      <div style={{ position: 'absolute', top: '2px', left: advancedConfigEnabled ? '22px' : '2px', width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </div>

                {advancedConfigEnabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                      <label className="input-label">Set Pass Percentage (%)</label>
                      <input 
                        type="number" 
                        min="1" max="100" 
                        className="input-field" 
                        value={passPercentage} 
                        onChange={(e) => setPassPercentage(parseInt(e.target.value) || 80)} 
                        placeholder="e.g. 80" 
                      />
                    </div>
                    <div>
                      <label className="input-label">Set Max Attempts</label>
                      <input 
                        type="number" 
                        min="1" max="10" 
                        className="input-field" 
                        value={maxAttempts} 
                        onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 3)} 
                        placeholder="e.g. 3" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Add questions button */}`;

content = content.replace(uiTarget, uiReplace);

// 6. Update Examinee Results Table Columns & Rows
content = content.replace("<th>Percentage</th>\n                          <th>Status</th>", "<th>Percentage</th>\n                          <th>Status</th>\n                          <th>Attempt</th>");

// We need to calculate attempt number. Since `attempts` is an array of all attempts, we can just filter it.
const mapTarget = `                          .map(att => {
                          const pct = Math.round((att.score / att.total_questions) * 100);
                          const isPassing = pct >= 50;

                          return (
                            <tr key={att.id}>
                              <td style={{ fontWeight: '600' }}>{att.display_name}</td>
                              <td>{att.student_email}</td>
                              <td>{att.test_title}</td>`;

const mapReplace = `                          .map(att => {
                          const testDetails = tests.find(t => t.id === att.test_id);
                          const currentPassPct = testDetails?.pass_percentage || 50;
                          const currentMaxAttempts = testDetails?.max_attempts || 3;
                          const pct = Math.round((att.score / att.total_questions) * 100);
                          const isPassing = pct >= currentPassPct;
                          
                          // Calculate attempt number by counting chronologically older attempts by same student for same test
                          const studentAttempts = attempts.filter(a => a.test_id === att.test_id && a.student_email === att.student_email).sort((a,b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
                          const attemptIndex = studentAttempts.findIndex(a => a.id === att.id) + 1;

                          return (
                            <tr key={att.id}>
                              <td style={{ fontWeight: '600' }}>{att.display_name}</td>
                              <td>{att.student_email}</td>
                              <td>{att.test_title}</td>`;

content = content.replace(mapTarget, mapReplace);

const tdTarget = `                              <td>
                                <span className={\`chip \${isPassing ? 'chip-success' : 'chip-error'}\`}>
                                  {isPassing ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                              <td>{new Date(att.completed_at).toLocaleDateString()}</td>`;

const tdReplace = `                              <td>
                                <span className={\`chip \${isPassing ? 'chip-success' : 'chip-error'}\`}>
                                  {isPassing ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                              <td style={{ fontWeight: '600', color: '#64748b' }}>({attemptIndex}/{currentMaxAttempts})</td>
                              <td>{new Date(att.completed_at).toLocaleDateString()}</td>`;

content = content.replace(tdTarget, tdReplace);

// 7. Change allowed_retry logic in the table! If attemptIndex < currentMaxAttempts, the user can implicitly retry without teacher needing to click "Allow Retry". 
// But if they reached the limit, maybe they need it. Actually, "Revoke Retry" / "Allow Retry" button is based on \`allowed_retry\` flag. The Teacher requested "Set reattempt option so teacher can have full configuration controll". The system automatically allows up to `max_attempts`. The button `allowed_retry` might override it to allow an *additional* retry.
// For now, I will just leave the button as is, since the UI allows it.

fs.writeFileSync('src/components/TeacherDashboard.tsx', content);
console.log('TeacherDashboard updated successfully.');

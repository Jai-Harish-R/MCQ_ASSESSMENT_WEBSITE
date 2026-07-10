const fs = require('fs');
let p = 'src/components/TeacherDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add state variable
const stateTarget = `  const [accessEnd, setAccessEnd] = useState('');`;
const stateReplacement = `  const [accessEnd, setAccessEnd] = useState('');
  const [allowedEmailsInput, setAllowedEmailsInput] = useState('');`;
c = c.replace(stateTarget, stateReplacement);

// 2. Add allowed_emails to the demo mode insert
const demoTarget = `          access_end: accessEnd ? new Date(accessEnd).toISOString() : null
        };`;
const demoReplacement = `          access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
          allowed_emails: allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : null
        };`;
c = c.replace(demoTarget, demoReplacement);

// 3. Add allowed_emails to the Supabase insert
const sbTarget = `            access_end: accessEnd ? new Date(accessEnd).toISOString() : null
          })
          .select()`;
const sbReplacement = `            access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
            allowed_emails: allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : null
          })
          .select()`;
c = c.replace(sbTarget, sbReplacement);

// 4. Add the textarea to the UI form below the Access End Time
const uiTarget = `                  </div>
                </div>

                <div className="section-title">
                  <span className="section-number">2</span>
                  Add Questions
                </div>`;
const uiReplacement = `                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Allowed Student Emails (Optional)</label>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    Enter a comma-separated list of student emails who are allowed to take this test. If left blank, anyone with the access code can join.
                  </p>
                  <textarea
                    className="input-field"
                    placeholder="student1@example.com, student2@example.com"
                    value={allowedEmailsInput}
                    onChange={(e) => setAllowedEmailsInput(e.target.value)}
                    style={{ minHeight: '80px', width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div className="section-title">
                  <span className="section-number">2</span>
                  Add Questions
                </div>`;
c = c.replace(uiTarget, uiReplacement);

fs.writeFileSync(p, c);
console.log('TeacherDashboard patched successfully');

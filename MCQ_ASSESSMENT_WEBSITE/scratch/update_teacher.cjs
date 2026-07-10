const fs = require('fs');
let p = 'src/components/TeacherDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add state variables
const stateTarget = `const [testTitle, setTestTitle] = useState('');`;
const stateReplace = `const [testTitle, setTestTitle] = useState('');
  const [targetYear, setTargetYear] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const profession = user.user_metadata?.profession;`;
c = c.replace(stateTarget, stateReplace);

// 2. Add to insert payload
const payloadTarget = `            access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
            allowed_emails: strictValidation ? (allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : []) : null
          };`;
const payloadReplace = `            access_end: accessEnd ? new Date(accessEnd).toISOString() : null,
            allowed_emails: strictValidation ? (allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : []) : null,
            target_year: profession === 'College / University' ? targetYear : null,
            target_class: profession === 'School' ? targetClass : null
          };`;
c = c.replace(payloadTarget, payloadReplace);

// 3. Add to UI
const uiTarget = `                    <label className="input-label">Assessment Title</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Physics Quiz 1"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label">Access Code PIN (Numeric)</label>`;

const uiReplace = `                    <label className="input-label">Assessment Title</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Physics Quiz 1"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                    />
                  </div>

                  {profession === 'College / University' && (
                    <div>
                      <label className="input-label">Target Year</label>
                      <select className="input-field" value={targetYear} onChange={e => setTargetYear(e.target.value)} required>
                        <option value="" disabled>Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  )}

                  {profession === 'School' && (
                    <div>
                      <label className="input-label">Target Class</label>
                      <select className="input-field" value={targetClass} onChange={e => setTargetClass(e.target.value)} required>
                        <option value="" disabled>Select Class</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="input-label">Access Code PIN (Numeric)</label>`;
c = c.replace(uiTarget, uiReplace);

// Reset fields on submit
const resetTarget = `        setTestTitle('');
        setAccessCode('');`;
const resetReplace = `        setTestTitle('');
        setAccessCode('');
        setTargetYear('');
        setTargetClass('');`;
c = c.replace(resetTarget, resetReplace);

fs.writeFileSync(p, c);
console.log('Successfully updated TeacherDashboard.tsx');

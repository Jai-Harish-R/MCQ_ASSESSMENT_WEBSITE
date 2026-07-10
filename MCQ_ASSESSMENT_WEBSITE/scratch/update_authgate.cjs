const fs = require('fs');
let p = 'src/components/AuthGate.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Inject state variables
const stateTarget = `const [fullName, setFullName] = useState('');`;
const stateReplace = `const [fullName, setFullName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [profession, setProfession] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [department, setDepartment] = useState('');
  const [className, setClassName] = useState('');
  const [year, setYear] = useState('');`;
c = c.replace(stateTarget, stateReplace);

// 2. Inject into signUp payload
const payloadTarget = `              full_name: fullName,
            },`;
const payloadReplace = `              full_name: fullName,
              phone_no: activeTab === 'teacher' ? phoneNo : undefined,
              profession: activeTab === 'teacher' ? profession : undefined,
              institution_name: activeTab === 'teacher' ? institutionName : undefined,
              department: activeTab === 'teacher' ? department : undefined,
              class_name: activeTab === 'teacher' ? className : undefined,
              year: activeTab === 'teacher' ? year : undefined,
            },`;
c = c.replace(payloadTarget, payloadReplace);

// 3. Pass user_metadata to onAuthSuccess
// There are two places: fallback and success.
c = c.replace(/role: userRole as 'teacher' \| 'student',\s*}, false\);/g, 
  "role: userRole as 'teacher' | 'student',\n              user_metadata: data.user.user_metadata,\n            }, false);");

c = c.replace(/role: profile.role as 'teacher' \| 'student',\s*}, false\);/g, 
  "role: profile.role as 'teacher' | 'student',\n              user_metadata: data.user.user_metadata,\n            }, false);");

// 4. Inject UI fields
const uiTarget = `                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Email Address</label>`;

const uiReplace = `                  </div>
                </div>
              )}

              {isSignUp && activeTab === 'teacher' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Phone No</label>
                    <input
                      type="tel"
                      style={{ 
                        width: '100%', padding: '14px 16px', borderRadius: '12px', 
                        border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a',
                        outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                      }}
                      placeholder="Enter your phone number"
                      value={phoneNo}
                      onChange={(e) => setPhoneNo(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>I am from</label>
                    <select
                      style={{ 
                        width: '100%', padding: '14px 16px', borderRadius: '12px', 
                        border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a',
                        outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                        appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3A%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3A%22292.4%22%20height%3A%22292.4%22%3E%3Cpath%20fill%3A%22%23475569%22%20d%3A%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px top 50%', backgroundSize: '12px auto'
                      }}
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      disabled={loading}
                      required
                    >
                      <option value="" disabled>Select...</option>
                      <option value="School">🏫 School</option>
                      <option value="College / University">🎓 College / University</option>
                      <option value="Company">🏢 Company</option>
                      <option value="Other">✨ Other</option>
                    </select>
                  </div>

                  {profession === 'College / University' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>College Name</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter college name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} disabled={loading} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Department</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={loading} required />
                      </div>
                    </>
                  )}

                  {profession === 'Company' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Company Name</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter company name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} disabled={loading} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Department</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={loading} required />
                      </div>
                    </>
                  )}

                  {profession === 'School' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>School Name</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter school name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} disabled={loading} required />
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Email Address</label>`;

c = c.replace(uiTarget, uiReplace);

fs.writeFileSync(p, c);
console.log('Successfully updated AuthGate.tsx');

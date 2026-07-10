const fs = require('fs');
let p = 'src/components/TeacherDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add strictValidation state right after allowedEmailsInput
const stateTarget = `  const [allowedEmailsInput, setAllowedEmailsInput] = useState('');`;
const stateReplacement = `  const [allowedEmailsInput, setAllowedEmailsInput] = useState('');
  const [strictValidation, setStrictValidation] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        // Simple regex to find emails in the text
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9_-]+)/gi;
        const matches = text.match(emailRegex) || [];
        // Deduplicate and append to existing input
        const currentEmails = allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e);
        const uniqueNew = [...new Set(matches)].filter(m => !currentEmails.includes(m));
        
        if (uniqueNew.length > 0) {
          const combined = [...currentEmails, ...uniqueNew].join(', ');
          setAllowedEmailsInput(combined);
          alert(\`Successfully imported \${uniqueNew.length} new email(s).\`);
        } else {
          alert('No new valid emails found in the file.');
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };`;
c = c.replace(stateTarget, stateReplacement);

// 2. Update demo insert logic
const demoTarget = `allowed_emails: allowedEmailsInput.trim() ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : null`;
const demoReplacement = `allowed_emails: (strictValidation && allowedEmailsInput.trim()) ? allowedEmailsInput.split(',').map(e => e.trim()).filter(e => e) : null`;
// Note: This replaces both demo and supabase insert since they use the exact same string
c = c.replace(new RegExp(demoTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), demoReplacement);

// 3. Inject the UI
const uiTarget = `                  </div>
                </div>
              </div>

              {/* MCQ question list builder */}`;
const uiReplacement = `                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '15px', color: '#0f172a' }}>
                        Strict Email Validation
                      </label>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        When enabled, only students with the specified emails can access this test.
                      </p>
                    </div>
                    
                    {/* Toggle Switch */}
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ position: 'relative' }}>
                        <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={strictValidation} onChange={() => setStrictValidation(!strictValidation)} />
                        <div style={{ display: 'block', width: '48px', height: '28px', backgroundColor: strictValidation ? '#ea580c' : '#cbd5e1', borderRadius: '9999px', transition: 'background-color 0.3s' }}></div>
                        <div style={{ position: 'absolute', left: strictValidation ? '22px' : '2px', top: '2px', backgroundColor: 'white', width: '24px', height: '24px', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                      </div>
                    </label>
                  </div>

                  {strictValidation && (
                    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '13px' }}>Allowed Emails (Comma-separated)</label>
                        
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#ea580c', backgroundColor: '#fff7ed', padding: '6px 12px', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                          Import Emails (CSV/TXT)
                          <input type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />
                        </label>
                      </div>
                      
                      <textarea
                        className="input-field"
                        placeholder="student1@example.com, student2@example.com"
                        value={allowedEmailsInput}
                        onChange={(e) => setAllowedEmailsInput(e.target.value)}
                        style={{ minHeight: '100px', width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* MCQ question list builder */}`;
c = c.replace(uiTarget, uiReplacement);

fs.writeFileSync(p, c);
console.log('Toggle and File Import injected successfully');

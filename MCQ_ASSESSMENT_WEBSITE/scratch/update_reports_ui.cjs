const fs = require('fs');

let p = 'src/components/TeacherDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// Target the Examinee Performance Reports header and dropdown
const targetBlock = `              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Examinees Performance Reports</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '4px' }}>
                  High-density logs of Examinees outcomes and retry options.
                </p>
              </div>

              {/* Published Test Filter for Reports */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', width: '100%', maxWidth: '400px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Published Test</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', backgroundColor: '#3b82f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <ClipboardEdit size={14} />
                  </div>
                  <select 
                    value={selectedReportTestId}
                    onChange={(e) => setSelectedReportTestId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 44px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#0f172a', appearance: 'none', outline: 'none', height: '44px', backgroundColor: '#fff' }}
                  >
                    <option value="">-- Choose a test --</option>
                    {tests.map(t => (
                      <option key={t.id} value={t.id}>{t.title} (PIN: {t.access_code})</option>
                    ))}
                  </select>
                </div>
              </div>`;

const replaceBlock = `              {/* Hero Banner Header */}
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '24px 32px', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ zIndex: 10 }}>
                  <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>Examinee Performance Reports</h1>
                  <p style={{ color: '#475569', fontSize: '15px', margin: 0 }}>
                    Review high-density logs of examinee outcomes and retry options.
                  </p>
                </div>
                
                {/* CSS/Icon Illustration Mock */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', opacity: 0.9, zIndex: 10 }}>
                  <div style={{ width: '140px', height: '90px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#60a5fa' }}></div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
                        <div style={{ width: '8px', height: '24px', backgroundColor: '#93c5fd', borderRadius: '2px' }}></div>
                        <div style={{ width: '8px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                        <div style={{ width: '8px', height: '16px', backgroundColor: '#bfdbfe', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginBottom: '6px' }}></div>
                      <div style={{ width: '60%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                </div>

                {/* Background Blobs for Hero */}
                <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 1 }}></div>
              </div>

              {/* Custom Styled Select Dropdown (Matches Image Perfectly) */}
              <div style={{ width: '100%', maxWidth: '800px', marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Select Conducted Test</label>
                
                <div style={{ position: 'relative', width: '100%', border: '1px solid #3b82f6', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,0.08)', transition: 'all 0.2s ease', cursor: 'pointer' }} className="custom-select-container">
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                      <ClipboardEdit size={20} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                      {selectedReportTestId ? tests.find(t => t.id === selectedReportTestId)?.title : '-- Choose a test --'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {selectedReportTestId && (
                      <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.02em' }}>
                        Published
                      </span>
                    )}
                    <ChevronDown size={20} color="#0f172a" style={{ opacity: 0.6 }} />
                  </div>

                  {/* Hidden Native Select overlays the entire container */}
                  <select 
                    value={selectedReportTestId}
                    onChange={(e) => setSelectedReportTestId(e.target.value)}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', appearance: 'none' }}
                  >
                    <option value="">-- Choose a test --</option>
                    {tests.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>`;

c = c.replace(targetBlock, replaceBlock);

fs.writeFileSync(p, c);
console.log('UI updated successfully.');

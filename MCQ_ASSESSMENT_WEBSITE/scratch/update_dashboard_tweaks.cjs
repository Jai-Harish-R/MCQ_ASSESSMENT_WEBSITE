const fs = require('fs');

let p = 'src/components/TeacherDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Dynamic Header
const headerTarget = `<h1 className="header-title">{dashboardTitle}</h1>
            <p className="header-subtitle">{dashboardSubtitle}</p>`;

const headerReplace = `<h1 className="header-title">Welcome back, {teacherDisplayName} 👋</h1>
            <p className="header-subtitle" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
              {profession === 'College / University' || profession === 'Company' ? user.user_metadata?.designation : profession === 'School' ? 'Teacher' : ''}
            </p>`;
c = c.replace(headerTarget, headerReplace);


// 2. Strict Number Inputs
const durationTarget = `<label className="input-label">Test Duration (Minutes)</label>
                    <input
                      type="number"
                      className="input-field"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />`;
                    
const durationReplace = `<label className="input-label">Test Duration (Minutes)</label>
                    <input
                      type="number"
                      className="input-field"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      onKeyDown={(e) => e.preventDefault()}
                    />`;
c = c.replace(durationTarget, durationReplace);

const studentsTarget = `<label className="input-label">Total No of Students</label>
                    <input
                      type="number"
                      className="input-field"
                      min="1"
                      value={totalStudents}
                      onChange={(e) => setTotalStudents(Number(e.target.value))}
                    />`;

const studentsReplace = `<label className="input-label">Total No of Students</label>
                    <input
                      type="number"
                      className="input-field"
                      min="1"
                      value={totalStudents}
                      onChange={(e) => setTotalStudents(Number(e.target.value))}
                      onKeyDown={(e) => e.preventDefault()}
                    />`;
c = c.replace(studentsTarget, studentsReplace);


// 3. Published Test filter dropdown in Examinee Performance Reports
// We need state for selectedReportTestId.
const stateTarget = `const [selectedLeaderboardTestId, setSelectedLeaderboardTestId] = useState('');`;
const stateReplace = `const [selectedLeaderboardTestId, setSelectedLeaderboardTestId] = useState('');
  const [selectedReportTestId, setSelectedReportTestId] = useState('');`;
c = c.replace(stateTarget, stateReplace);

// We need to filter 'attempts' based on selectedReportTestId
const attemptsTarget = `                  <div className="table-container">
                    <table className="density-table">
                      <thead>
                        <tr>`;

// Before this block, we insert the select dropdown.
const reportsHeaderTarget = `<h1 style={{ fontSize: '24px', fontWeight: '700' }}>Examinee Performance Reports</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '4px' }}>
                  High-density logs of Examinee outcomes and retry options.
                </p>
              </div>`;

const reportsHeaderReplace = `<h1 style={{ fontSize: '24px', fontWeight: '700' }}>Examinee Performance Reports</h1>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '4px' }}>
                  High-density logs of Examinee outcomes and retry options.
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
c = c.replace(reportsHeaderTarget, reportsHeaderReplace);

// Now filter the actual mapped attempts array
const mappedTarget = `{attempts.map(att => {`;
const mappedReplace = `{attempts.filter(att => selectedReportTestId ? att.test_id === selectedReportTestId : true).map(att => {`;
c = c.replace(mappedTarget, mappedReplace);

fs.writeFileSync(p, c);
console.log('TeacherDashboard.tsx updated.');

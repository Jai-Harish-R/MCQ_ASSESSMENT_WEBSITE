const fs = require('fs');

let p = 'src/components/TeacherDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add sortConfig state
c = c.replace(
  "  const [selectedReportTestId, setSelectedReportTestId] = useState<string>('');",
  "  const [selectedReportTestId, setSelectedReportTestId] = useState<string>('');\n  const [sortConfig, setSortConfig] = useState<'name_asc' | 'name_desc' | 'mark_asc' | 'mark_desc' | ''>('');"
);

// 2. Add getTestStatus helper function right before `const handleLogout` or similar top level
c = c.replace(
  "  // Load stats and tables",
  "  const getTestStatus = (t: Test) => {\n    if (!t.access_start && !t.access_end) return 'Live';\n    const now = new Date().getTime();\n    if (t.access_start && now < new Date(t.access_start).getTime()) return 'Not Started';\n    if (t.access_end && now > new Date(t.access_end).getTime()) return 'Ended';\n    return 'Live';\n  };\n\n  // Load stats and tables"
);

// 3. Update the table UI: Add sort dropdown, change headers, and replace the table body with sorted logic.
// Find the header for Examinees Results
const examineesResultsHeaderTarget = `              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Examinees Results</h3>
                
                {/* Custom Styled Select Dropdown (Matches Image Perfectly) */}
                <div style={{ position: 'relative', width: '320px' }}>`;

const examineesResultsHeaderReplace = `              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Examinees Results</h3>
                
                <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '600px', justifyContent: 'flex-end' }}>
                
                {/* Sort Dropdown */}
                <div style={{ position: 'relative', width: '220px' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', 
                    borderRadius: '12px', padding: '12px 16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' 
                  }}>
                    <div style={{ width: '100%', fontSize: '14px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sortConfig === 'name_asc' ? 'Student Name (A-Z)' : 
                       sortConfig === 'name_desc' ? 'Student Name (Z-A)' : 
                       sortConfig === 'mark_asc' ? 'Mark (Low-High)' : 
                       sortConfig === 'mark_desc' ? 'Mark (High-Low)' : 
                       'Sort by...'}
                    </div>
                    <ChevronDown size={20} color="#0f172a" style={{ opacity: 0.6 }} />
                  </div>
                  <select 
                    value={sortConfig}
                    onChange={(e) => setSortConfig(e.target.value as any)}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', appearance: 'none' }}
                  >
                    <option value="">Sort by...</option>
                    <option value="name_asc">Student Name (A-Z)</option>
                    <option value="name_desc">Student Name (Z-A)</option>
                    <option value="mark_asc">Mark (Low-High)</option>
                    <option value="mark_desc">Mark (High-Low)</option>
                  </select>
                </div>

                {/* Custom Styled Select Dropdown (Matches Image Perfectly) */}
                <div style={{ position: 'relative', width: '320px' }}>`;

c = c.replace(examineesResultsHeaderTarget, examineesResultsHeaderReplace);

// Don't forget to close the flex container we just opened around the two dropdowns:
// The original was:
//                   </select>
//                 </div>
//               </div>
// We need to add an extra `</div>` for the new flex container.
const examineesResultsHeaderEndTarget = `                  </select>
                </div>
              </div>

              <div className="card">`;

const examineesResultsHeaderEndReplace = `                  </select>
                </div>
                </div>
              </div>

              <div className="card">`;
c = c.replace(examineesResultsHeaderEndTarget, examineesResultsHeaderEndReplace);

// 4. Update the tag inside the test filter
const filterTagTarget = `                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {selectedReportTestId && (
                      <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.02em' }}>
                        Published
                      </span>
                    )}
                    <ChevronDown size={20} color="#0f172a" style={{ opacity: 0.6 }} />
                  </div>`;

const filterTagReplace = `                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {selectedReportTestId && tests.find(t => t.id === selectedReportTestId) && (() => {
                      const status = getTestStatus(tests.find(t => t.id === selectedReportTestId)!);
                      let bg = '#dcfce7', color = '#16a34a', dot = '🟢';
                      if (status === 'Not Started') { bg = '#fee2e2'; color = '#ef4444'; dot = '🔴'; }
                      if (status === 'Ended') { bg = '#f1f5f9'; color = '#64748b'; dot = '⚪'; }
                      return (
                        <span style={{ backgroundColor: bg, color: color, padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {dot} {status}
                        </span>
                      );
                    })()}
                    <ChevronDown size={20} color="#0f172a" style={{ opacity: 0.6 }} />
                  </div>`;

c = c.replace(filterTagTarget, filterTagReplace);

// 5. Replace table headers and body
const tableTarget = `                    <table className="density-table">
                      <thead>
                        <tr>
                          <th>Examinee Name</th>
                          <th>Examinee Email</th>
                          <th>Test Title</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Submitted Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.filter(att => selectedReportTestId ? att.test_id === selectedReportTestId : true).map(att => {
                          const pct = Math.round((att.score / att.total_questions) * 100);
                          const isPassing = pct >= 50;
                          
                          // Determine display name
                          const studentName = att.student_email.toLowerCase().includes('harish')
                            ? 'Harish'
                            : (att.student_name || att.student_email.split('@')[0]);

                          return (
                            <tr key={att.id}>
                              <td style={{ fontWeight: '600' }}>{studentName}</td>
                              <td>{att.student_email}</td>
                              <td>{att.test_title}</td>
                              <td style={{ fontWeight: '700' }}>{att.score} / {att.total_questions}</td>
                              <td>
                                <span className={\`chip \${isPassing ? 'chip-success' : 'chip-error'}\`}>
                                  {pct}% {isPassing ? 'Passed' : 'Failed'}
                                </span>
                              </td>
                              <td>{new Date(att.completed_at).toLocaleDateString()}</td>
                              <td>
                                <button
                                  onClick={() => handleToggleRetry(att.id, att.allowed_retry)}
                                  disabled={syncing}
                                  className={\`btn \${att.allowed_retry ? 'btn-danger' : 'btn-outline'}\`}
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                  {att.allowed_retry ? 'Revoke Retry' : 'Allow Retry'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>`;

const tableReplace = `                    <table className="density-table">
                      <thead>
                        <tr>
                          <th>Examinee Name</th>
                          <th>Examinee Email</th>
                          <th>Test Title</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Status</th>
                          <th>Submitted Date</th>
                          <th>Submitted Time</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts
                          .filter(att => selectedReportTestId ? att.test_id === selectedReportTestId : true)
                          .map(att => {
                            const studentName = att.student_email.toLowerCase().includes('harish')
                              ? 'Harish'
                              : (att.student_name || att.student_email.split('@')[0]);
                            return { ...att, display_name: studentName };
                          })
                          .sort((a, b) => {
                            if (sortConfig === 'name_asc') return a.display_name.localeCompare(b.display_name);
                            if (sortConfig === 'name_desc') return b.display_name.localeCompare(a.display_name);
                            if (sortConfig === 'mark_asc') return a.score - b.score;
                            if (sortConfig === 'mark_desc') return b.score - a.score;
                            return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(); // default
                          })
                          .map(att => {
                          const pct = Math.round((att.score / att.total_questions) * 100);
                          const isPassing = pct >= 50;

                          return (
                            <tr key={att.id}>
                              <td style={{ fontWeight: '600' }}>{att.display_name}</td>
                              <td>{att.student_email}</td>
                              <td>{att.test_title}</td>
                              <td style={{ fontWeight: '700' }}>{att.score} / {att.total_questions}</td>
                              <td>{pct}%</td>
                              <td>
                                <span className={\`chip \${isPassing ? 'chip-success' : 'chip-error'}\`}>
                                  {isPassing ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                              <td>{new Date(att.completed_at).toLocaleDateString()}</td>
                              <td>{new Date(att.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td>
                                <button
                                  onClick={() => handleToggleRetry(att.id, att.allowed_retry)}
                                  disabled={syncing}
                                  className={\`btn \${att.allowed_retry ? 'btn-danger' : 'btn-outline'}\`}
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                  {att.allowed_retry ? 'Revoke Retry' : 'Allow Retry'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>`;

c = c.replace(tableTarget, tableReplace);

fs.writeFileSync(p, c);
console.log('Done!');

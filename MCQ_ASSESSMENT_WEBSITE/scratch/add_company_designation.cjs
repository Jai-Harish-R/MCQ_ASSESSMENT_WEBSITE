const fs = require('fs');

let pAuth = 'src/components/AuthGate.tsx';
let cAuth = fs.readFileSync(pAuth, 'utf8');

// Update payload condition to include Company for designation
cAuth = cAuth.replace(
  "designation: activeTab === 'teacher' && profession === 'College / University' ? designation : undefined,",
  "designation: activeTab === 'teacher' && (profession === 'College / University' || profession === 'Company') ? designation : undefined,"
);

// Find the Company block and insert the Designation dropdown
const uiTarget = `{profession === 'Company' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Company Name</label>`;

const companyBlock = cAuth.indexOf(uiTarget);
if (companyBlock !== -1) {
  const insertTarget = `<div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Department</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={loading} required />
                      </div>`;
  
  const insertReplace = `<div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Department</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={loading} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Designation</label>
                        <select
                          style={{ 
                            width: '100%', padding: '14px 16px', borderRadius: '12px', 
                            border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a',
                            outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                            appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3A%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3A%22292.4%22%20height%3A%22292.4%22%3E%3Cpath%20fill%3A%22%23475569%22%20d%3A%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px top 50%', backgroundSize: '12px auto'
                          }}
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          disabled={loading}
                          required
                        >
                          <option value="" disabled>Select Designation</option>
                          <option value="HR">HR</option>
                          <option value="Trainer">Trainer</option>
                          <option value="Manager">Manager</option>
                          <option value="Team Lead">Team Lead</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Recruiter">Recruiter</option>
                        </select>
                      </div>`;
  
  // Use a targeted replacement by doing a split and join around the Company block to ensure we don't hit the College block's "Department" field accidentally.
  const split1 = cAuth.substring(0, companyBlock);
  const split2 = cAuth.substring(companyBlock);
  cAuth = split1 + split2.replace(insertTarget, insertReplace);
}

fs.writeFileSync(pAuth, cAuth);
console.log('Company designation added');

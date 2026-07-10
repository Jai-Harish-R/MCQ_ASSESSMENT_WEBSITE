const fs = require('fs');

let pAuth = 'src/components/AuthGate.tsx';
let cAuth = fs.readFileSync(pAuth, 'utf8');

// 1. Add state variable
cAuth = cAuth.replace(
  "const [year, setYear] = useState('');",
  "const [year, setYear] = useState('');\n  const [designation, setDesignation] = useState('');"
);

// 2. Add to payload
cAuth = cAuth.replace(
  "year: activeTab === 'teacher' ? year : undefined,",
  "year: activeTab === 'teacher' ? year : undefined,\n              designation: activeTab === 'teacher' && profession === 'College / University' ? designation : undefined,"
);

// 3. Add to UI for College
const uiTarget = `{profession === 'College / University' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>College Name</label>`;

const uiReplace = `{profession === 'College / University' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>College Name</label>`;

const collegeBlock = cAuth.indexOf(uiTarget);
if (collegeBlock !== -1) {
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
                          <option value="Lecturer">Lecturer</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Professor">Professor</option>
                          <option value="Senior Professor">Senior Professor</option>
                          <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                          <option value="Dean">Dean</option>
                          <option value="Course Coordinator">Course Coordinator</option>
                          <option value="Teaching Assistant">Teaching Assistant</option>
                        </select>
                      </div>`;
  
  cAuth = cAuth.replace(insertTarget, insertReplace);
}

fs.writeFileSync(pAuth, cAuth);

// Update SQL script artifact
let pSql = 'supabase_schema_update.sql';
if (fs.existsSync(pSql)) {
  let cSql = fs.readFileSync(pSql, 'utf8');
  cSql = cSql.replace(
    "ADD COLUMN IF NOT EXISTS department text,",
    "ADD COLUMN IF NOT EXISTS department text,\nADD COLUMN IF NOT EXISTS designation text,"
  );
  fs.writeFileSync(pSql, cSql);
}

console.log('Designation added');

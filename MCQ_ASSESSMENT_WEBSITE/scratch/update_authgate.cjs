const fs = require('fs');

let content = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

// Add Country Code State
content = content.replace(
  "  const [phoneNo, setPhoneNo] = useState('');",
  "  const [phoneNo, setPhoneNo] = useState('');\n  const [countryCode, setCountryCode] = useState('+91');"
);

// Form submission validation logic
const submitLogicTarget = `    if (isSignUp && activeTab === 'teacher') {
      if (!fullName.trim()) return setErrorMsg("Please enter your full name.");
      if (!phoneNo.trim()) return setErrorMsg("Please enter your phone number.");
      if (!profession) return setErrorMsg("Please select your profession.");
      if (!institutionName.trim()) return setErrorMsg("Please enter your organization name.");
    }`;

const submitLogicReplace = `    if (isSignUp && activeTab === 'teacher') {
      if (!fullName.trim()) return setErrorMsg("Please enter your full name.");
      if (!phoneNo.trim()) return setErrorMsg("Please enter your phone number.");
      
      // Phone Number Validation based on Country Code
      const cleanPhone = phoneNo.replace(/\\D/g, '');
      if (countryCode === '+91' && cleanPhone.length !== 10) return setErrorMsg("Indian phone numbers must be exactly 10 digits.");
      if (countryCode === '+1' && cleanPhone.length !== 10) return setErrorMsg("US/Canada phone numbers must be exactly 10 digits.");
      if (countryCode === '+44' && cleanPhone.length < 10) return setErrorMsg("UK phone numbers must be at least 10 digits.");
      if (countryCode === '+61' && cleanPhone.length !== 9) return setErrorMsg("Australian phone numbers must be exactly 9 digits.");

      if (!profession) return setErrorMsg("Please select your profession.");
      if (!institutionName.trim()) return setErrorMsg("Please enter your organization name.");
    }`;

content = content.replace(submitLogicTarget, submitLogicReplace);

// Update Supabase sign up payload to include country code
content = content.replace(
  "              phone_no: activeTab === 'teacher' ? phoneNo : undefined,",
  "              phone_no: activeTab === 'teacher' ? \`\${countryCode} \${phoneNo}\` : undefined,"
);

// Replace Phone No input with Country Code + Phone No
const phoneInputTarget = `                  <div>
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
                  </div>`;

const phoneInputReplace = `                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Phone No</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <select
                        style={{ 
                          width: '100px', padding: '14px 12px', borderRadius: '12px', 
                          border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px', color: '#0f172a',
                          outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', cursor: 'pointer'
                        }}
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        disabled={loading}
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                      </select>
                      <input
                        type="tel"
                        style={{ 
                          flex: 1, padding: '14px 16px', borderRadius: '12px', 
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
                  </div>`;

content = content.replace(phoneInputTarget, phoneInputReplace);

// Remove Department from Company profession block
const companyBlockTarget = `                  {profession === 'Company' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Company Name</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter company name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} disabled={loading} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Department</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={loading} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Designation</label>`;

const companyBlockReplace = `                  {profession === 'Company' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Company Name</label>
                        <input type="text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter company name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} disabled={loading} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Designation</label>`;

content = content.replace(companyBlockTarget, companyBlockReplace);

fs.writeFileSync('src/components/AuthGate.tsx', content);
console.log('AuthGate updated successfully.');

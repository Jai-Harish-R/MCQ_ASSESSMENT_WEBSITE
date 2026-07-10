const fs = require('fs');
let content = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

const oldStr = `    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      setLoading(false);
      return;
    }`;

const newStr = `    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (isSignUp && activeTab === 'teacher') {
      const cleanPhone = phoneNo.replace(/\\D/g, '');
      if (countryCode === '+91' && cleanPhone.length !== 10) {
        setErrorMsg('Indian phone numbers must be exactly 10 digits.');
        setLoading(false);
        return;
      }
      if (countryCode === '+1' && cleanPhone.length !== 10) {
        setErrorMsg('US phone numbers must be exactly 10 digits.');
        setLoading(false);
        return;
      }
      if (countryCode === '+44' && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
        setErrorMsg('UK phone numbers must be 10 or 11 digits.');
        setLoading(false);
        return;
      }
    }`;

content = content.replace(oldStr, newStr);

const uiOld = `                  <div>
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

const uiNew = `                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Phone No</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', overflow: 'hidden', boxSizing: 'border-box', transition: 'border-color 0.2s' }}>
                      <select
                        style={{
                          padding: '14px 8px 14px 16px', border: 'none', backgroundColor: 'transparent', fontSize: '15px', color: '#475569', outline: 'none', cursor: 'pointer', appearance: 'none', fontWeight: '600'
                        }}
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        disabled={loading}
                      >
                        <option value="+91">IND +91</option>
                        <option value="+1">USA +1</option>
                        <option value="+44">UK +44</option>
                      </select>
                      <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 8px' }}></div>
                      <input
                        type="tel"
                        style={{ 
                          flex: 1, padding: '14px 16px 14px 8px', border: 'none', backgroundColor: 'transparent', fontSize: '15px', color: '#0f172a', outline: 'none', width: '100%'
                        }}
                        placeholder="8248598758"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>`;

content = content.replace(uiOld, uiNew);
fs.writeFileSync('src/components/AuthGate.tsx', content);
console.log('done');

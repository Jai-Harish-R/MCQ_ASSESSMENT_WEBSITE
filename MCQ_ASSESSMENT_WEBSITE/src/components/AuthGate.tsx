import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Mail, Lock, AlertCircle, ArrowRight, User, CheckCircle2, GraduationCap, School, ShieldCheck } from 'lucide-react';

interface AuthGateProps {
  onAuthSuccess: (user: { id: string; email: string; role: 'teacher' | 'student'; user_metadata?: any }, isDemo: boolean) => void;
}

export default function AuthGate({ onAuthSuccess }: AuthGateProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [profession, setProfession] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [department, setDepartment] = useState('');
  const [className, setClassName] = useState('');
  const [year, setYear] = useState('');
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [showSandbox, setShowSandbox] = useState(false);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setShowSandbox(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: activeTab,
              full_name: fullName,
              phone_no: activeTab === 'teacher' ? phoneNo : undefined,
              profession: activeTab === 'teacher' ? profession : undefined,
              institution_name: activeTab === 'teacher' ? institutionName : undefined,
              department: activeTab === 'teacher' ? department : undefined,
              class_name: activeTab === 'teacher' ? className : undefined,
              year: activeTab === 'teacher' ? year : undefined,
              designation: activeTab === 'teacher' && profession === 'College / University' ? designation : undefined,
            },
          },
        });

        if (error) throw error;
        
        if (data.user) {
          setSuccessMsg('Registration successful! Please sign in using your credentials.');
          setIsSignUp(false);
        }
      } else {
        // Sign In Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Verify user role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error("Profile error:", profileError);
            const userRole = data.user.user_metadata?.role || activeTab;
            onAuthSuccess({
              id: data.user.id,
              email: data.user.email || email,
              role: userRole as 'teacher' | 'student',
              user_metadata: data.user.user_metadata,
            }, false);
            return;
          }

          if (profile.role !== activeTab) {
            await supabase.auth.signOut();
            setErrorMsg(`Access denied: This account is registered as a ${profile.role}. Please log in to the correct portal.`);
            setLoading(false);
            return;
          }

          onAuthSuccess({
            id: data.user.id,
            email: data.user.email || email,
            role: profile.role as 'teacher' | 'student',
              user_metadata: data.user.user_metadata,
            }, false);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchDemo = (role: 'student' | 'teacher') => {
    const dummyEmail = role === 'teacher' ? 'JAI@SEC.EDU' : 'HARISH@SEC.EDU';
    onAuthSuccess({
      id: role === 'teacher' ? 'demo-teacher-123' : 'demo-student-456',
      email: dummyEmail,
      role: role,
    }, true);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fef6f0', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(to right bottom, #fffaf7, #ffedd5)'
    }}>
      
      {/* Top Navigation Bar */}
      <header style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '24px 60px'
      }}>
        <div 
          onClick={handleLogoClick}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ea580c',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '18px'
          }}>
            C
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', fontFamily: 'var(--font-headlines)' }}>
            Coders<span style={{ color: '#ea580c' }}>Fun</span>
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Home</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>About</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Training</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Software Development</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Job Support</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Corporate</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Placements</a>
        </div>
        
        <button style={{ 
          backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '24px', 
          padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)'
        }}>
          Contact Us
        </button>
      </header>

      {/* Main Split Content */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 60px', gap: '80px', maxWidth: '1300px', margin: '0 auto', width: '100%'
      }}>
        
        {/* Left Panel: Brand info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ display: 'flex' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '24px', backgroundColor: '#fff7ed',
              color: '#ea580c', fontSize: '12px', fontWeight: '800',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              <ShieldCheck size={16} /> Secure Assessment Platform
            </span>
          </div>

          <h1 style={{
            fontSize: '56px', fontWeight: '800', color: '#0f172a', lineHeight: '1.1',
            letterSpacing: '-0.02em', fontFamily: 'var(--font-headlines)'
          }}>
            Secure Your Future <br />
            with <span style={{ color: '#ea580c' }}>CodersFun</span>
          </h1>

          <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', maxWidth: '480px' }}>
            Access your verified MCQ platform. Log in to manage assessments, track performance, and secure your educational credentials with industry-leading reliability.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ea580c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>100% Secure</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Proctored Environment</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Trusted Platform</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Used by Top Universities</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Panel: Login Card */}
        <div style={{ flex: '0 0 460px' }}>
          <div style={{ 
            backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px', 
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08), 0 10px 15px -5px rgba(0,0,0,0.04)',
            border: '1px solid rgba(255,255,255,0.5)'
          }}>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
                Secure MCQ Assessment Platform
              </span>
            </div>

            {/* Tab Selection */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#f8fafc',
              padding: '6px', borderRadius: '12px', marginBottom: '24px'
            }}>
              <button
                type="button"
                onClick={() => { setActiveTab('student'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '12px', fontWeight: '700', fontSize: '14px', border: 'none', borderRadius: '8px',
                  backgroundColor: activeTab === 'student' ? '#ffffff' : 'transparent',
                  color: activeTab === 'student' ? '#ea580c' : '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: activeTab === 'student' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <GraduationCap size={18} /> Take Test
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('teacher'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '12px', fontWeight: '700', fontSize: '14px', border: 'none', borderRadius: '8px',
                  backgroundColor: activeTab === 'teacher' ? '#ffffff' : 'transparent',
                  color: activeTab === 'teacher' ? '#ea580c' : '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: activeTab === 'teacher' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <School size={18} /> Conduct Test
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <span style={{
                fontSize: '11px', fontWeight: '800', color: '#475569',
                backgroundColor: '#f1f5f9', padding: '6px 16px', borderRadius: '24px',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {activeTab === 'student' ? 'Student Testing Lobby' : 'Educator Lobby'}
              </span>
            </div>

            {errorMsg && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: '#fef2f2',
                color: '#b91c1c', padding: '16px', borderRadius: '12px', fontSize: '14px', marginBottom: '24px',
                border: '1px solid #fee2e2'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : String(errorMsg)}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: '#f0fdf4',
                color: '#15803d', padding: '16px', borderRadius: '12px', fontSize: '14px', marginBottom: '24px',
                border: '1px solid #dcfce7'
              }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isSignUp && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      style={{ 
                        width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', 
                        border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a',
                        outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
                      }}
                      placeholder="e.g. Harish Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Select Organization Type</label>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    style={{ 
                      width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', 
                      border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a',
                      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
                    }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    style={{ 
                      width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', 
                      border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', color: '#0f172a',
                      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
                    }}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ 
                  width: '100%', padding: '16px', backgroundColor: '#ea580c', color: 'white', 
                  border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px 0 rgba(234, 88, 12, 0.2)', transition: 'background-color 0.2s, transform 0.1s'
                }}
                disabled={loading}
              >
                {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            {showSandbox && (
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Sandbox Bypass Tools</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => handleLaunchDemo('student')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>Demo Student</button>
                  <button onClick={() => handleLaunchDemo('teacher')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>Demo Teacher</button>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Mail, Lock, AlertCircle, ArrowRight, User, CheckCircle2, GraduationCap, School } from 'lucide-react';

interface AuthGateProps {
  onAuthSuccess: (user: { id: string; email: string; role: 'teacher' | 'student' }, isDemo: boolean) => void;
}

export default function AuthGate({ onAuthSuccess }: AuthGateProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [showSandbox, setShowSandbox] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

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
              username: username,
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
          // Verify user role in the profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error("Profile error:", profileError);
            // Fallback: If profile table trigger hasn't run yet, we will provision a profile
            // directly or allow it to go through to make local dev smooth.
            const userRole = data.user.user_metadata?.role || activeTab;
            onAuthSuccess({
              id: data.user.id,
              email: data.user.email || email,
              role: userRole as 'teacher' | 'student',
            }, false);
            return;
          }

          if (profile.role !== activeTab) {
            // Log out user if role is mismatch
            await supabase.auth.signOut();
            setErrorMsg(`Access denied: This account is registered as a ${profile.role}. Please log in to the correct portal.`);
            setLoading(false);
            return;
          }

          onAuthSuccess({
            id: data.user.id,
            email: data.user.email || email,
            role: profile.role as 'teacher' | 'student',
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!email) {
      setErrorMsg('Please enter your email address to reset your password.');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;
      
      setSuccessMsg('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      console.error("Password reset error:", err);
      setErrorMsg(err.message || 'An error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  // Launch Demo/Sandbox bypass mode
  const handleLaunchDemo = (role: 'student' | 'teacher') => {
    const dummyEmail = role === 'teacher' ? 'JAI@SEC.EDU' : 'HARISH@SEC.EDU';
    onAuthSuccess({
      id: role === 'teacher' ? 'demo-teacher-123' : 'demo-student-456',
      email: dummyEmail,
      role: role,
    }, true);
  };

  return (
    <div className="login-split-container" style={{ position: 'relative', paddingTop: '80px' }}>
      
      {/* Top Navigation Bar */}
      <header className="login-navbar">
        <div 
          onClick={handleLogoClick}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#ea580c',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '18px'
          }}>
            C
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', fontFamily: 'var(--font-headlines)' }}>
            Coders<span style={{ color: '#ea580c' }}>Fun</span>
          </span>
        </div>
        
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#" className="nav-link-item">Home</a>
          <a href="#" className="nav-link-item">About</a>
          <a href="#" className="nav-link-item">Training</a>
          <a href="#" className="nav-link-item">Software Development</a>
          <a href="#" className="nav-link-item">Job Support</a>
          <a href="#" className="nav-link-item">Corporate</a>
          <a href="#" className="nav-link-item">Placements</a>
          <button className="btn btn-primary" style={{ borderRadius: '24px', padding: '8px 20px', fontSize: '13px' }}>Contact Us</button>
        </div>
      </header>

      {/* Left Panel: Brand info */}
      <div className="login-left-panel">
        <div className="login-left-content" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Label Pill */}
          <div style={{ display: 'flex' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: '#ffedd5',
              color: '#c2410c',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              🛡️ Secure Assessment Platform
            </span>
          </div>

          <h1 style={{
            fontSize: '44px',
            fontWeight: '800',
            color: '#0f172a',
            lineHeight: '1.15',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-headlines)'
          }}>
            Secure Your Future <br />
            with <span style={{ color: '#ea580c' }}>CodersFun</span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#475569',
            lineHeight: '1.6',
            maxWidth: '460px'
          }}>
            Access your verified MCQ platform. Log in to manage assessments, track performance, and secure your educational credentials with industry-leading reliability.
          </p>

          {/* Highlights Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            <div className="login-benefit-card">
              <div className="login-benefit-icon" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
                🛡️
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>100% Secure</h4>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Proctored Environment</p>
              </div>
            </div>

            <div className="login-benefit-card">
              <div className="login-benefit-icon" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                🎓
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Trusted Platform</h4>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Used by Top Universities</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          © {new Date().getFullYear()} CodersFun. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Login Card */}
      <div className="login-right-panel">
        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
              Secure MCQ Assessment Platform
            </span>
          </div>

          {/* Tab Selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: 'var(--radius-default)',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                padding: '10px',
                fontFamily: 'var(--font-headlines)',
                fontWeight: '600',
                fontSize: '13px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTab === 'student' ? '#ffffff' : 'transparent',
                color: activeTab === 'student' ? '#ea580c' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: activeTab === 'student' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <GraduationCap size={16} /> Take Test
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('teacher'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                padding: '10px',
                fontFamily: 'var(--font-headlines)',
                fontWeight: '600',
                fontSize: '13px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTab === 'teacher' ? '#ffffff' : 'transparent',
                color: activeTab === 'teacher' ? '#ea580c' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: activeTab === 'teacher' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <School size={16} /> Conduct Test
            </button>
          </div>

          {/* Testing Lobby Pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#475569',
              backgroundColor: '#f1f5f9',
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {activeTab === 'student' ? 'Student Testing Lobby' : 'Educator Lobby'}
            </span>
          </div>

          {/* Success/Error Alerts */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              backgroundColor: 'var(--color-success-container)',
              color: 'var(--color-on-success-container)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-success)' }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    className="input-field"
                    style={{ paddingLeft: '38px' }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', marginTop: '12px', borderRadius: 'var(--radius-sm)' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Send Reset Link'}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%'
                  }}
                >
                  <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isSignUp && (
                  <>
                    <div>
                      <label className="input-label">Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                          type="text"
                          className="input-field"
                          style={{ paddingLeft: '38px' }}
                          placeholder="e.g. Harish Kumar"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Username</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                          type="text"
                          className="input-field"
                          style={{ paddingLeft: '38px' }}
                          placeholder="e.g. harish_123"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="input-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="email"
                      className="input-field"
                      style={{ paddingLeft: '38px' }}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div>
                  {!isSignUp ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                      <button 
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }}
                        style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  ) : (
                    <label className="input-label">Password</label>
                  )}
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="password"
                      className="input-field"
                      style={{ paddingLeft: '38px' }}
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
                  className="btn btn-primary"
                  style={{ width: '100%', height: '44px', marginTop: '12px', borderRadius: 'var(--radius-sm)' }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : isSignUp ? `Sign Up` : 'Sign In'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              {/* Toggle Log In / Sign Up */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </>
          )}

          {/* Sandbox Development bypass */}
          {showSandbox && (
            <div style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px'
              }}>
                Sandbox Development Tools
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleLaunchDemo('student')}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '11px' }}
                >
                  Demo Student
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchDemo('teacher')}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '11px' }}
                >
                  Demo Teacher
                </button>
              </div>
              <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>
                Bypasses Supabase server connection for evaluation.
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

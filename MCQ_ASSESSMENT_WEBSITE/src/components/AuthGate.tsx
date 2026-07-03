import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { GraduationCap, School, Mail, Lock, AlertCircle, ArrowRight, Activity, User } from 'lucide-react';

interface AuthGateProps {
  onAuthSuccess: (user: { id: string; email: string; role: 'teacher' | 'student' }, isDemo: boolean) => void;
}

export default function AuthGate({ onAuthSuccess }: AuthGateProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--color-background)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-on-primary-container)',
            marginBottom: '12px'
          }}>
            <GraduationCap size={24} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-headlines)', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.01em' }}>
            EduVerify Pro
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
            Secure MCQ Assessment Platform
          </p>
        </div>

        {/* Portal Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--color-surface-container-high)',
          padding: '4px',
          borderRadius: 'var(--radius-default)',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => { setActiveTab('student'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '8px',
              fontFamily: 'var(--font-headlines)',
              fontWeight: '500',
              fontSize: '13px',
              border: 'none',
              borderRadius: 'var(--radius-default)',
              backgroundColor: activeTab === 'student' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'student' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <GraduationCap size={16} />
            Take Test
          </button>
          <button
            onClick={() => { setActiveTab('teacher'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '8px',
              fontFamily: 'var(--font-headlines)',
              fontWeight: '500',
              fontSize: '13px',
              border: 'none',
              borderRadius: 'var(--radius-default)',
              backgroundColor: activeTab === 'teacher' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'teacher' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <School size={16} />
            Conduct Test
          </button>
        </div>

        {/* Portal Info Chip */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <span className="chip chip-neutral">
            {activeTab === 'teacher' ? 'Educator/Administrator Portal' : 'Student Testing Lobby'}
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
            borderRadius: 'var(--radius-default)',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
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
            borderRadius: 'var(--radius-default)',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)', marginTop: '8px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-headlines)',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--color-on-surface-variant)'
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-outline)'
                }} />
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
          )}
          
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-headlines)',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '6px',
              color: 'var(--color-on-surface-variant)'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-outline)'
              }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: '38px' }}
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-headlines)',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '6px',
              color: 'var(--color-on-surface-variant)'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-outline)'
              }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? `Register as ${activeTab === 'teacher' ? 'Teacher' : 'Student'}` : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Sign In / Sign Up Toggle */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-secondary)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Demo Mode / Sandbox Options */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--color-outline-variant)',
          textAlign: 'center'
        }}>
          <p style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--color-outline)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <Activity size={12} /> Sandbox Development Tools
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleLaunchDemo('student')}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              Demo Student
            </button>
            <button
              onClick={() => handleLaunchDemo('teacher')}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              Demo Teacher
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-outline)', marginTop: '8px' }}>
            Bypasses Supabase server connection for evaluation.
          </p>
        </div>

      </div>
    </div>
  );
}

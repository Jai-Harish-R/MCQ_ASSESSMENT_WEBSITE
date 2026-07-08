import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Mail, Lock, AlertCircle, ArrowRight, User, CheckCircle2, GraduationCap, School, Code, CheckCircle, X } from 'lucide-react';

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
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    <div style={{ minHeight: '100vh', backgroundColor: '#faf9f8', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <header style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '24px 60px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Home</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>About</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Training</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Software Development</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Job Support</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Corporate</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Placements</a>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setShowLoginModal(true)} style={{ 
            background: 'none', border: 'none', color: '#ea580c', fontWeight: '600', cursor: 'pointer', fontSize: '14px' 
          }}>
            Log In
          </button>
          <button className="btn btn-primary" style={{ borderRadius: '24px', padding: '10px 24px', fontSize: '14px', fontWeight: '600' }}>
            Contact Us
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main style={{ 
        flex: 1, display: 'flex', alignItems: 'center', 
        padding: '120px 60px 60px', gap: '60px', maxWidth: '1400px', margin: '0 auto' 
      }}>
        
        {/* Left Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '24px', backgroundColor: '#ffedd5',
              color: '#c2410c', fontSize: '12px', fontWeight: '700'
            }}>
              🚀 Your Tech Career Starts Here
            </span>
          </div>

          <h1 style={{
            fontSize: '64px', fontWeight: '800', color: '#0f172a', lineHeight: '1.1',
            letterSpacing: '-0.02em', fontFamily: 'var(--font-headlines)'
          }}>
            Launch Your <span style={{ color: '#ea580c' }}>Tech Career</span> With Industry Experts
          </h1>

          <p style={{
            fontSize: '18px', color: '#475569', lineHeight: '1.6', maxWidth: '540px'
          }}>
            From practical training to job placement, software development to real-time support — CodersFun is your complete technology partner for success.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
            <button className="btn btn-primary" style={{ 
              borderRadius: '32px', padding: '16px 32px', fontSize: '16px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              Explore Courses <ArrowRight size={18} />
            </button>
            <button style={{ 
              borderRadius: '32px', padding: '16px 32px', fontSize: '16px', fontWeight: '600',
              backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              Book Free Demo
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '48px', 
            marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' 
          }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#ea580c' }}>5000+</div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Students Trained</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#ea580c' }}>95%</div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Placement Rate</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#ea580c' }}>100+</div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Hiring Partners</div>
            </div>
          </div>

        </div>

        {/* Right Image Content */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-10%', right: '-10%', width: '120%', height: '120%',
            background: 'radial-gradient(circle, rgba(255,237,213,0.8) 0%, rgba(250,249,248,0) 70%)',
            zIndex: 0
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80" alt="Students coding" style={{ width: '100%', height: '560px', objectFit: 'cover', display: 'block' }} />
          </div>
          
          {/* Floating Card 1 */}
          <div style={{
            position: 'absolute', top: '40px', left: '-40px', zIndex: 2,
            backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{ backgroundColor: '#ea580c', color: 'white', padding: '12px', borderRadius: '12px' }}>
              <Code size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '16px' }}>Java Full Stack</div>
              <div style={{ color: '#64748b', fontSize: '13px' }}>Most Popular</div>
            </div>
          </div>

          {/* Floating Card 2 */}
          <div style={{
            position: 'absolute', bottom: '40px', right: '-40px', zIndex: 2,
            backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{ backgroundColor: '#22c55e', color: 'white', padding: '12px', borderRadius: '12px' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '16px' }}>100% Job Ready</div>
              <div style={{ color: '#64748b', fontSize: '13px' }}>Practical Training</div>
            </div>
          </div>
        </div>

      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '36px', position: 'relative' }}>
            
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Log In to CodersFun</h2>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                Secure MCQ Assessment Platform
              </span>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#f1f5f9',
              padding: '4px', borderRadius: '8px', marginBottom: '20px'
            }}>
              <button
                type="button"
                onClick={() => { setActiveTab('student'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '10px', fontWeight: '600', fontSize: '13px', border: 'none', borderRadius: '6px',
                  backgroundColor: activeTab === 'student' ? '#ffffff' : 'transparent',
                  color: activeTab === 'student' ? '#ea580c' : '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: activeTab === 'student' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <GraduationCap size={16} /> Take Test
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('teacher'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '10px', fontWeight: '600', fontSize: '13px', border: 'none', borderRadius: '6px',
                  backgroundColor: activeTab === 'teacher' ? '#ffffff' : 'transparent',
                  color: activeTab === 'teacher' ? '#ea580c' : '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: activeTab === 'teacher' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <School size={16} /> Conduct Test
              </button>
            </div>

            {errorMsg && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: 'var(--color-error-container)',
                color: 'var(--color-on-error-container)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: 'var(--color-success-container)',
                color: 'var(--color-on-success-container)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px'
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-success)' }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isSignUp && (
                <div>
                  <label className="input-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="text" className="input-field" style={{ paddingLeft: '38px' }} placeholder="e.g. Harish Kumar" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} required />
                  </div>
                </div>
              )}

              <div>
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="email" className="input-field" style={{ paddingLeft: '38px' }} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
                </div>
              </div>

              <div>
                <label className="input-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="password" className="input-field" style={{ paddingLeft: '38px' }} placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '12px', borderRadius: '8px' }} disabled={loading}>
                {loading ? 'Processing...' : isSignUp ? `Sign Up` : 'Sign In'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
            
            {/* Quick Demo Bypass (Dev Only) */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', textAlign: 'center' }}>
               <button onClick={() => handleLaunchDemo('student')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>
                 Auto-Login as Demo Student
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

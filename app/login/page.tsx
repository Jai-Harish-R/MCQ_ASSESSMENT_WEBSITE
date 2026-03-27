'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'patient' | 'caregiver' | 'doctor'

const roleConfig = {
  patient: {
    label: 'Patient',
    emoji: '🧑',
    color: '#00D4AA',
    shadow: 'rgba(0,212,170,0.4)',
    border: 'rgba(0,212,170,0.5)',
    redirect: '/patient/dashboard',
  },
  caregiver: {
    label: 'Caregiver',
    emoji: '👨‍👩‍👧',
    color: '#F59E0B',
    shadow: 'rgba(245,158,11,0.4)',
    border: 'rgba(245,158,11,0.5)',
    redirect: '/caregiver/dashboard',
  },
  doctor: {
    label: 'Doctor',
    emoji: '🩺',
    color: '#6366F1',
    shadow: 'rgba(99,102,241,0.4)',
    border: 'rgba(99,102,241,0.5)',
    redirect: '/doctor/dashboard',
  },
}

const healthStats = [
  { icon: '🩸', stat: '42%', label: 'adults have hypertension' },
  { icon: '🍬', stat: '11.4%', label: 'diabetic rate globally' },
  { icon: '💊', stat: '68%', label: 'medicine non-adherence' },
]

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cfg = roleConfig[role]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (isRegister && !fullName) { setError('Please enter your full name.'); return }
    setLoading(true)
    try {
      // Try real Supabase auth
      const { signIn, signUp } = await import('@/lib/supabase')
      if (isRegister) {
        await signUp(email, password, role, fullName)
      } else {
        await signIn(email, password)
      }
    } catch {
      // On error or if Supabase not configured, demo redirect
    }
    // ─── Demo: always redirect by role ───
    setTimeout(() => {
      router.push(cfg.redirect)
    }, 600)
  }

  const accentGradient = `linear-gradient(135deg, ${cfg.color} 0%, ${role === 'patient' ? '#00A885' : role === 'doctor' ? '#4F46E5' : '#D97706'} 100%)`

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0F2C 0%, #0D1435 50%, #080E28 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* ECG Background Animation */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: 0,
        right: 0,
        height: '80px',
        opacity: 0.12,
        overflow: 'hidden',
      }}>
        <svg
          viewBox="0 0 2880 80"
          style={{ width: '200%', height: '100%', animation: 'ecg-scroll 8s linear infinite' }}
          preserveAspectRatio="none"
        >
          <path
            fill="none"
            stroke="#00D4AA"
            strokeWidth="2.5"
            d="M0,40 L480,40 L510,40 L530,8 L550,72 L570,8 L590,40 L640,40 L1120,40 L1150,40 L1170,8 L1190,72 L1210,8 L1230,40 L1280,40 L1760,40 L1790,40 L1810,8 L1830,72 L1850,8 L1870,40 L1920,40 L2400,40 L2430,40 L2450,8 L2470,72 L2490,8 L2510,40 L2560,40 L2880,40"
          />
        </svg>
      </div>

      {/* Glowing orbs */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px',
        background: `radial-gradient(circle, ${cfg.color}18 0%, transparent 70%)`,
        borderRadius: '50%', transition: 'background 0.5s ease',
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', left: '-100px', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '36px', animation: 'fade-in 0.6s ease-out' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🩺</div>
        <h1 style={{
          fontFamily: 'Sora, sans-serif', fontSize: '2.2rem', fontWeight: 800,
          background: `linear-gradient(135deg, #ffffff 0%, ${cfg.color} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', transition: 'all 0.4s ease',
        }}>VitalSync</h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.95rem', marginTop: '4px' }}>
          Your health, intelligently managed
        </p>
      </div>

      {/* Glass Card */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${cfg.border}`,
        borderRadius: '24px',
        padding: '36px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: `0 8px 60px rgba(0,0,0,0.4), 0 0 40px ${cfg.shadow}30`,
        animation: 'bounce-in 0.5s ease-out',
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
      }}>
        {/* Role Selector */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Select Your Role
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {(Object.entries(roleConfig) as [Role, typeof roleConfig.patient][]).map(([key, config]) => (
              <button
                key={key}
                id={`role-${key}`}
                onClick={() => setRole(key)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: '14px',
                  border: role === key ? `2px solid ${config.color}` : '2px solid rgba(255,255,255,0.1)',
                  background: role === key ? `${config.color}22` : 'rgba(255,255,255,0.04)',
                  color: role === key ? config.color : '#9CA3AF',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{config.emoji}</span>
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div>
              <label style={{ color: '#9CA3AF', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input
                id="fullname-input"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, inputFocusStyle(cfg.color))}
                onBlur={e => Object.assign(e.target.style, inputStyle)}
              />
            </div>
          )}
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Email Address</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle(cfg.color))}
              onBlur={e => Object.assign(e.target.style, inputStyle)}
            />
          </div>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle(cfg.color))}
              onBlur={e => Object.assign(e.target.style, inputStyle)}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '10px 14px', color: '#FCA5A5', fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          <button
            id="submit-btn"
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'rgba(255,255,255,0.1)' : accentGradient,
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : `0 4px 20px ${cfg.shadow}`,
              marginTop: '4px',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {loading ? '⟳ Signing in...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle register */}
        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.875rem', marginTop: '20px' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={{
              background: 'none', border: 'none', color: cfg.color,
              fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
              transition: 'color 0.3s ease',
            }}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>

        {/* Demo shortcut */}
        <div style={{
          marginTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '16px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#6B7280', fontSize: '0.75rem', marginBottom: '10px' }}>Quick Demo Access</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {[
              { label: 'Patient', href: '/patient/dashboard', color: '#00D4AA' },
              { label: 'Doctor', href: '/doctor/dashboard', color: '#6366F1' },
              { label: 'Caregiver', href: '/caregiver/dashboard', color: '#F59E0B' },
            ].map(d => (
              <a key={d.label} href={d.href} style={{
                color: d.color, fontSize: '0.75rem', fontWeight: 600,
                textDecoration: 'none', padding: '4px 10px',
                border: `1px solid ${d.color}40`, borderRadius: '8px',
                transition: 'background 0.2s',
              }}>
                {d.label} →
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Health Stats Bar */}
      <div style={{
        marginTop: '32px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '16px 28px',
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '600px',
        width: '100%',
        animation: 'fade-in 0.8s ease-out 0.3s both',
      }}>
        {healthStats.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
            <div>
              <span style={{ color: '#00D4AA', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'JetBrains Mono, monospace' }}>
                {s.stat}
              </span>
              <span style={{ color: '#6B7280', fontSize: '0.78rem', marginLeft: '6px' }}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  padding: '12px 16px',
  color: 'white',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  fontFamily: 'DM Sans, sans-serif',
}

const inputFocusStyle = (color: string): React.CSSProperties => ({
  borderColor: color,
  boxShadow: `0 0 0 3px ${color}20`,
  background: 'rgba(255,255,255,0.08)',
})

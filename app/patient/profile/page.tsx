'use client'

import { useState } from 'react'

export default function ProfilePage() {
  const [lang, setLang] = useState('English')
  const [theme, setTheme] = useState('Light')

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', padding: '28px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <a href="/patient/dashboard" style={{ textDecoration: 'none', color: '#6B7280', fontSize: '1.2rem' }}>←</a>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.6rem', color: '#111827' }}>My Profile</h1>
        </div>

        {/* Header */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '32px', border: '1px solid #F3F4F6',
          display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00D4AA, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: 'white', fontWeight: 700,
          }}>P</div>
          <div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.4rem', color: '#111827', marginBottom: '4px' }}>Priya Sharma</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>42 years old</span>
              <span style={{ color: '#D1D5DB' }}>•</span>
              <span style={{ background: 'rgba(0,212,170,0.1)', color: '#00A885', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>PATIENT</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Medical Conditions */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', color: '#111827' }}>Medical Conditions</h3>
              <button style={{ color: '#6366F1', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>+ Add</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Hypertension Stage 1', 'Pre-Diabetes'].map(c => (
                <span key={c} style={{ background: '#F3F4F6', color: '#374151', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Linked Care Team */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', color: '#111827', marginBottom: '16px' }}>Care Team</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '2px' }}>Linked Doctor</p>
                <p style={{ fontSize: '0.9rem', color: '#111827', fontWeight: 600 }}>Dr. Ravi Kumar</p>
              </div>
              <button style={{ color: '#6366F1', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>Edit</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '2px' }}>Linked Caregiver</p>
                <p style={{ fontSize: '0.9rem', color: '#111827', fontWeight: 600 }}>Anita Sharma</p>
              </div>
              <button style={{ color: '#6366F1', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>Edit</button>
            </div>
          </div>

          {/* Preferences */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', color: '#111827', marginBottom: '16px' }}>Preferences</h3>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '8px' }}>Language</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['English', 'Hindi', 'Tamil'].map(l => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    background: lang === l ? 'rgba(99,102,241,0.1)' : '#F3F4F6',
                    color: lang === l ? '#6366F1' : '#4B5563',
                    border: `1px solid ${lang === l ? 'rgba(99,102,241,0.2)' : 'transparent'}`,
                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '8px' }}>Theme</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setTheme('Light')} style={{
                  background: theme === 'Light' ? '#111827' : '#F3F4F6',
                  color: theme === 'Light' ? 'white' : '#4B5563',
                  padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>☀️ Light</button>
                <button onClick={() => setTheme('Dark')} style={{
                  background: theme === 'Dark' ? '#111827' : '#F3F4F6',
                  color: theme === 'Dark' ? 'white' : '#4B5563',
                  padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>🌙 Dark</button>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', color: '#111827' }}>Emergency</h3>
              <button style={{ color: '#6366F1', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>+ Add</button>
            </div>
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.9rem', color: '#991B1B', fontWeight: 600 }}>Anita Sharma</p>
                <p style={{ fontSize: '0.8rem', color: '#EF4444' }}>+91-9876543210</p>
              </div>
              <span style={{ fontSize: '1.2rem' }}>📞</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #F3F4F6' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', color: '#111827', marginBottom: '16px' }}>Account Settings</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ background: '#F3F4F6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Change Password</button>
            <button style={{ background: '#F3F4F6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Export Data (PDF)</button>
            <button style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export default function SOSPage() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSend = () => {
    setStatus('sending')
    setTimeout(() => {
      setStatus('sent')
      setShowConfirm(false)
    }, 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: status === 'sent' ? '#0A0F2C' : '#1A0505',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      transition: 'background 0.5s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <a href="/patient/dashboard" style={{
        position: 'absolute', top: '28px', left: '28px',
        color: 'white', textDecoration: 'none', fontSize: '1.2rem',
        opacity: 0.8, background: 'rgba(255,255,255,0.1)',
        width: '40px', height: '40px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>←</a>

      {status !== 'sent' ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: '60px', zIndex: 10 }}>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '2rem', color: '#FCA5A5', marginBottom: '8px' }}>
              Emergency SOS
            </h1>
            <p style={{ color: '#F87171', fontSize: '1.1rem', opacity: 0.8 }}>
              Tap to alert your doctor and family
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px', height: '280px', zIndex: 10 }}>
            {/* Pulsing rings */}
            <div style={{
              position: 'absolute', inset: -40, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)', animation: 'pulse-ring 2s infinite',
            }} />
            <div style={{
              position: 'absolute', inset: -20, borderRadius: '50%',
              background: 'rgba(239,68,68,0.25)', animation: 'pulse-ring 2.5s infinite 0.5s',
            }} />
            
            {/* The Button */}
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                borderRadius: '50%', background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                border: '8px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 40px rgba(220,38,38,0.5), inset 0 -10px 20px rgba(0,0,0,0.2)',
                color: 'white', transition: 'transform 0.1s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '4rem', marginBottom: '8px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🆘</span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.1em' }}>SOS</span>
            </button>
          </div>

          <p style={{ color: '#9CA3AF', marginTop: '60px', fontSize: '0.9rem', maxWidth: '300px', textAlign: 'center', zIndex: 10 }}>
            This will share your GPS location and latest vitals to your emergency contacts via WhatsApp.
          </p>
        </>
      ) : (
        <div style={{ textAlign: 'center', animation: 'bounce-in 0.5s ease-out' }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.1)', border: '4px solid #10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '4rem', color: '#10B981', margin: '0 auto 24px',
          }}>
            ✓
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '2.5rem', color: 'white', marginBottom: '16px' }}>
            Alert Sent
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '1.2rem', marginBottom: '8px' }}>
            Help is on the way. Please stay calm.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', marginTop: '32px', textAlign: 'left', display: 'inline-block' }}>
            <p style={{ color: '#D1D5DB', marginBottom: '12px', fontSize: '0.9rem' }}>Notified Contacts:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>📞</span>
              <div>
                <p style={{ color: 'white', fontWeight: 600 }}>Anita Sharma (Caregiver)</p>
                <p style={{ color: '#10B981', fontSize: '0.8rem' }}>Location Shared ✓</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>👨‍⚕️</span>
              <div>
                <p style={{ color: 'white', fontWeight: 600 }}>Dr. Ravi Kumar</p>
                <p style={{ color: '#10B981', fontSize: '0.8rem' }}>Dashboard Alerted ✓</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '90%',
            textAlign: 'center', animation: 'bounce-in 0.3s ease-out',
          }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.4rem', color: '#111827', marginBottom: '12px' }}>Confirm SOS</h2>
            <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '32px' }}>
              Are you sure you want to trigger an emergency alert to Dr. Ravi Kumar and Anita Sharma?
            </p>
            {status === 'sending' ? (
              <button disabled style={{ width: '100%', background: '#EF4444', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, opacity: 0.7 }}>
                Sending Alert...
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button onClick={handleSend} style={{ width: '100%', background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>
                  Yes, Send Alert Now
                </button>
                <button onClick={() => setShowConfirm(false)} style={{ width: '100%', background: '#F3F4F6', color: '#4B5563', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

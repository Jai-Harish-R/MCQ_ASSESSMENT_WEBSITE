import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0A0F2C', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '3rem', fontFamily: 'Sora, sans-serif', color: '#00D4AA', marginBottom: '8px' }}>🩺 VitalSync</h1>
        <p style={{ color: '#9CA3AF', fontSize: '1.1rem' }}>Your health, intelligently managed</p>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/login" style={{
          background: 'linear-gradient(135deg, #00D4AA, #00A885)',
          color: 'white', padding: '12px 28px', borderRadius: '12px',
          textDecoration: 'none', fontWeight: 600, fontSize: '1rem'
        }}>
          Sign In
        </Link>
        <Link href="/patient/dashboard" style={{
          background: 'rgba(255,255,255,0.08)', color: 'white', 
          padding: '12px 28px', borderRadius: '12px',
          textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          Patient Demo
        </Link>
        <Link href="/doctor/dashboard" style={{
          background: 'rgba(99,102,241,0.2)', color: '#A5B4FC', 
          padding: '12px 28px', borderRadius: '12px',
          textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
          border: '1px solid rgba(99,102,241,0.3)'
        }}>
          Doctor Demo
        </Link>
        <Link href="/caregiver/dashboard" style={{
          background: 'rgba(245,158,11,0.2)', color: '#FCD34D', 
          padding: '12px 28px', borderRadius: '12px',
          textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
          border: '1px solid rgba(245,158,11,0.3)'
        }}>
          Caregiver Demo
        </Link>
      </div>
    </div>
  )
}

'use client'

interface BiomarkerCardProps {
  label: string
  value: string
  status: 'HIGH' | 'LOW' | 'NORMAL' | 'CRITICAL' | 'BORDERLINE'
  normal: string
  explanation?: string
  showDetails?: boolean
}

const statusConfig = {
  HIGH: { emoji: '🔴', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: 'HIGH' },
  LOW: { emoji: '🔵', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', text: 'LOW' },
  NORMAL: { emoji: '🟢', color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: 'NORMAL' },
  CRITICAL: { emoji: '🚨', color: '#DC2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.3)', text: 'CRITICAL' },
  BORDERLINE: { emoji: '🟡', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: 'BORDERLINE' },
}

export default function BiomarkerCard({ label, value, status, normal, explanation, showDetails = true }: BiomarkerCardProps) {
  const cfg = statusConfig[status] || statusConfig.NORMAL

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${cfg.border}`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <p style={{ fontSize: '0.78rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            {label}
          </p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>
            {value}
          </p>
        </div>
        <div style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: '10px',
          padding: '4px 12px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ fontSize: '0.9rem' }}>{cfg.emoji}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cfg.color, letterSpacing: '0.06em' }}>
            {cfg.text}
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: explanation ? '12px' : 0 }}>
        Normal: <span style={{ color: '#6B7280', fontWeight: 600 }}>{normal}</span>
      </p>

      {explanation && showDetails && (
        <div style={{
          background: cfg.bg,
          borderRadius: '10px',
          padding: '10px 12px',
          marginTop: '4px',
        }}>
          <p style={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.5 }}>{explanation}</p>
        </div>
      )}
    </div>
  )
}

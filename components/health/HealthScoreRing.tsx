'use client'

import { useMemo } from 'react'
import { getHealthScoreColor, getHealthScoreLabel } from '@/lib/utils'

interface HealthScoreRingProps {
  score: number
  breakdown: {
    medicineAdherence: number
    vitalStability: number
    reportTrend: number
    dietCompliance: number
  }
}

export default function HealthScoreRing({ score, breakdown }: HealthScoreRingProps) {
  const color = useMemo(() => getHealthScoreColor(score), [score])
  const label = useMemo(() => getHealthScoreLabel(score), [score])
  
  const radius = 70
  const strokeWidth = 10
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference

  const bars = [
    { label: 'Medicine Adherence', value: breakdown.medicineAdherence, color: '#00D4AA' },
    { label: 'Vital Stability', value: breakdown.vitalStability, color: '#3B82F6' },
    { label: 'Report Trend', value: breakdown.reportTrend, color: '#8B5CF6' },
    { label: 'Diet Compliance', value: breakdown.dietCompliance, color: '#F59E0B' },
  ]

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      border: '1px solid #F3F4F6',
    }}>
      <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.9rem', color: '#6B7280', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Health Score
      </h3>
      
      {/* Ring */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '168px', height: '168px' }}>
          <svg width="168" height="168" viewBox="0 0 168 168" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="84" cy="84" r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
            {/* Progress */}
            <circle
              cx="84" cy="84" r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${color}80)` }}
            />
          </svg>
          {/* Center text */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.2rem', fontWeight: 700, color, lineHeight: 1 }}>
              {score}%
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600, marginTop: '4px' }}>{label}</span>
          </div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {bars.map((bar) => (
          <div key={bar.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>{bar.label}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: bar.color, fontFamily: 'JetBrains Mono, monospace' }}>
                {bar.value}%
              </span>
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                background: bar.color,
                width: `${bar.value}%`,
                transition: 'width 1s ease-in-out',
                boxShadow: `0 0 6px ${bar.color}60`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

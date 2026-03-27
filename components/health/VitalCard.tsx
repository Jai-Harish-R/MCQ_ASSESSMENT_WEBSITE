'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface VitalCardProps {
  label: string
  value: string
  unit: string
  trend: string
  status: 'normal' | 'warning' | 'critical'
  sparkline: number[]
  icon: string
}

const statusColors = {
  normal: { dot: '#10B981', badge: 'rgba(16,185,129,0.12)', text: '#059669' },
  warning: { dot: '#F59E0B', badge: 'rgba(245,158,11,0.12)', text: '#D97706' },
  critical: { dot: '#EF4444', badge: 'rgba(239,68,68,0.12)', text: '#DC2626' },
}

export default function VitalCard({ label, value, unit, trend, status, sparkline, icon }: VitalCardProps) {
  const colors = statusColors[status]
  const data = sparkline.map((v, i) => ({ i, v }))
  const trendColor = trend.includes('↑') ? '#EF4444' : trend.includes('↓') ? '#10B981' : '#6B7280'

  return (
    <div style={{
      background: 'white',
      borderRadius: '18px',
      padding: '20px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      border: '1px solid #F3F4F6',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: colors.dot,
              display: 'inline-block', boxShadow: `0 0 6px ${colors.dot}`,
              animation: status !== 'normal' ? 'pulse-ring 2s infinite' : 'none',
            }} />
            <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {label}
            </span>
          </div>
          <div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.8rem', fontWeight: 700, color: '#111827' }}>
              {value}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#9CA3AF', marginLeft: '4px' }}>{unit}</span>
          </div>
        </div>
        <span style={{ fontSize: '1.6rem', opacity: 0.8 }}>{icon}</span>
      </div>

      {/* Sparkline */}
      <div style={{ height: '44px', margin: '8px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={colors.dot}
              strokeWidth={2}
              dot={false}
              strokeOpacity={0.8}
            />
            <Tooltip
              contentStyle={{ display: 'none' }}
              cursor={{ stroke: colors.dot, strokeWidth: 1, opacity: 0.3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        background: colors.badge,
        borderRadius: '8px', padding: '3px 10px',
        fontSize: '0.78rem', fontWeight: 600, color: trendColor,
      }}>
        {trend}
      </div>
    </div>
  )
}

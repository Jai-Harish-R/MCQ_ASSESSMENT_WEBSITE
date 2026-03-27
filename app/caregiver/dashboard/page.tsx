'use client'

import { useState } from 'react'
import { getHealthScoreColor, getRiskColor } from '@/lib/utils'
import { mockPatients, mockTimeline, mockMedicines } from '@/lib/mock-data'
import HealthScoreRing from '@/components/health/HealthScoreRing'

// We use the first patient as the linked one for the mock caregiver
const patient = mockPatients[0]

export default function CaregiverDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview')

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: 'DM Sans, sans-serif' }}>
      
      {/* Top Nav */}
      <div style={{
        background: 'white', borderBottom: '1px solid #F3F4F6', padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🩺</span>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>VitalSync</span>
          <span style={{
            background: 'rgba(245,158,11,0.1)', color: '#D97706',
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
            borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)'
          }}>CAREGIVER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}>
            🔔
            <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#EF4444', borderRadius: '50%' }} />
          </button>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', color: 'white', fontWeight: 700,
          }}>AS</div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px' }}>
        
        {/* Linked Patient Card */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '28px 32px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid #F3F4F6',
          marginBottom: '24px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', color: '#4F46E5', fontWeight: 700,
            }}>
              {patient.name.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Tracking
              </p>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.6rem', color: '#111827', fontWeight: 700, marginBottom: '4px' }}>
                {patient.name}
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#4B5563' }}>
                {patient.age} yrs • {patient.conditions[0]}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: '#F3F4F6', color: '#374151', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Manage Access</button>
            <button style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>📞</span> Call Patient
            </button>
          </div>
        </div>

        {/* Status Alerts Banner */}
        {patient.status === 'critical' ? (
          <div style={{ background: 'linear-gradient(90deg, #FEF2F2 0%, #FEE2E2 100%)', border: '1px solid #FCA5A5', borderRadius: '16px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '2rem', animation: 'pulse-ring 2s infinite' }}>🚨</span>
            <div>
              <h3 style={{ color: '#991B1B', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>SOS Triggered 10 mins ago</h3>
              <p style={{ color: '#B91C1C', fontSize: '0.85rem' }}>Priya pushed the emergency button. Dr. Ravi Kumar has been notified. Location shared to your WhatsApp.</p>
            </div>
            <button style={{ marginLeft: 'auto', background: '#DC2626', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View Live GPS</button>
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(90deg, #F0FDF4 0%, #ECFDF5 100%)', border: '1px solid #6EE7B7', borderRadius: '16px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '2rem' }}>✅</span>
            <div>
              <h3 style={{ color: '#065F46', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Patient is Stable</h3>
              <p style={{ color: '#047857', fontSize: '0.85rem' }}>All vitals in normal range today. Medicines taken on time.</p>
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'timeline', label: 'Activity Timeline' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{
              background: activeTab === t.id ? '#111827' : 'white',
              color: activeTab === t.id ? 'white' : '#4B5563',
              border: activeTab === t.id ? 'none' : '1px solid #D1D5DB',
              padding: '10px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
            
            {/* Left Col: Health Score & Reminders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <HealthScoreRing
                score={patient.healthScore}
                breakdown={{ medicineAdherence: 92, vitalStability: 85, reportTrend: 88, dietCompliance: 78 }}
              />
              
              <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', color: '#111827', marginBottom: '16px' }}>Today's Medicine Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {mockMedicines.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === mockMedicines.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{m.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{m.times.join(', ')}</p>
                      </div>
                      {/* Mock 1st taken, rest pending */}
                      {i === 0 ? (
                        <span style={{ background: '#ECFDF5', color: '#10B981', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>TAKEN</span>
                      ) : (
                        <span style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>PENDING</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Latest Vitals & Upcoming */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.1rem', color: '#111827' }}>Latest Vitals</h3>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Last synced: 2h ago</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Blood Pressure', val: patient.latestVitals.bp, unit: 'mmHg', color: getRiskColor(patient.status), icon: '💓' },
                    { label: 'Blood Sugar', val: '145', unit: 'mg/dL', color: '#F59E0B', icon: '🩸' },
                    { label: 'Heart Rate', val: '78', unit: 'bpm', color: '#10B981', icon: '❤️' },
                    { label: 'Oxygen', val: '98', unit: '%', color: '#10B981', icon: '🫁' },
                  ].map(v => (
                    <div key={v.label} style={{ padding: '16px', background: '#F9FAFB', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>{v.label}</span>
                        <span>{v.icon}</span>
                      </div>
                      <div>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.6rem', fontWeight: 700, color: v.color }}>{v.val}</span>
                        <span style={{ fontSize: '0.8rem', color: '#9CA3AF', marginLeft: '4px' }}>{v.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.1rem', color: '#111827', marginBottom: '20px' }}>Upcoming Doctor Visit</h3>
                <div style={{ background: 'linear-gradient(135deg, #0A0F2C 0%, #1a2456 100%)', borderRadius: '16px', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#00D4AA', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Cardiology Follow-up</p>
                    <h4 style={{ fontSize: '1.2rem', fontFamily: 'Sora, sans-serif', marginBottom: '4px' }}>Dr. Ravi Kumar</h4>
                    <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Tomorrow • 10:30 AM • Video Call</p>
                  </div>
                  <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>👨‍⚕️</div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', border: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.2rem', color: '#111827', marginBottom: '24px' }}>Activity Timeline</h3>
            <div style={{ position: 'relative', maxWidth: '600px' }}>
              <div style={{ position: 'absolute', left: '20px', top: '12px', bottom: '12px', width: '2px', background: '#E5E7EB' }} />
              {mockTimeline.map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '2px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', zIndex: 1, flexShrink: 0 }}>
                    {event.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>{event.event}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '2px 0 4px' }}>{event.detail}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

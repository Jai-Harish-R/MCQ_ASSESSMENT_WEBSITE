'use client'

import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockBPHistory, mockSugarHistory, mockStepsHistory, mockWeightHistory, mockHabitData } from '@/lib/mock-data'

export default function ProgressPage() {
  const [synced, setSynced] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', padding: '28px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="/patient/dashboard" style={{ textDecoration: 'none', color: '#6B7280', fontSize: '1.2rem' }}>←</a>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.6rem', color: '#111827' }}>My Progress</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['30 Days', '90 Days', '6 Months'].map((tf, i) => (
              <button key={tf} style={{
                background: i === 0 ? '#111827' : 'white',
                color: i === 0 ? 'white' : '#6B7280',
                border: i === 0 ? 'none' : '1px solid #D1D5DB',
                padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}>{tf}</button>
            ))}
          </div>
        </div>

        {/* Monthly Benchmark Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #F0FDF4 0%, #ECFDF5 100%)',
          border: '1px solid #A7F3D0', borderRadius: '16px', padding: '16px 24px',
          marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          <div style={{ fontSize: '1.8rem' }}>📊</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#065F46', fontWeight: 700, fontSize: '0.95rem' }}>This Month vs Last Month</h3>
            <div style={{ display: 'flex', gap: '24px', marginTop: '6px' }}>
              <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600 }}>Cholesterol: ↓ 8% 🎉</span>
              <span style={{ color: '#F59E0B', fontSize: '0.85rem', fontWeight: 600 }}>BP Systolic: ↑ 3% ⚠️</span>
              <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600 }}>HbA1c: ↓ 0.4% 🎉</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* BP Chart */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.1rem', marginBottom: '20px', color: '#111827' }}>Blood Pressure (mmHg)</h3>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockBPHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="systolic" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="diastolic" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }}/> Systolic</span>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366F1' }}/> Diastolic</span>
            </div>
          </div>

          {/* Blood Sugar */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.1rem', marginBottom: '20px', color: '#111827' }}>Blood Sugar (mg/dL)</h3>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockSugarHistory} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis domain={[80, 220]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="fasting" fill="#00D4AA" radius={[4,4,0,0]} barSize={12} />
                  <Bar dataKey="postMeal" fill="#F59E0B" radius={[4,4,0,0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 10, height: 10, borderRadius: '2px', background: '#00D4AA' }}/> Fasting</span>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 10, height: 10, borderRadius: '2px', background: '#F59E0B' }}/> Post-meal</span>
            </div>
          </div>

          {/* Steps & Google Fit */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.1rem', color: '#111827' }}>Steps Tracking</h3>
              {!synced ? (
                <button onClick={() => setSynced(true)} style={{ background: '#111827', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  Sync Google Fit
                </button>
              ) : (
                <span style={{ background: '#ECFDF5', color: '#10B981', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>✓ SYNCED</span>
              )}
            </div>
            
            {synced ? (
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStepsHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} interval={1} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="steps" fill="#3B82F6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #E5E7EB', borderRadius: '12px' }}>
                <div style={{ fontSize: '2.5rem', opacity: 0.5, marginBottom: '12px' }}>👣</div>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '16px' }}>Sync Google Fit to view daily steps</p>
                <button onClick={() => setSynced(true)} style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.1)', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Connect Now</button>
              </div>
            )}
          </div>

          {/* Weight */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.1rem', marginBottom: '20px', color: '#111827' }}>Weight Trend (kg)</h3>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockWeightHistory}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="weight" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 600 }}>Current BMI: 26.6</span>
              <span style={{ fontSize: '0.75rem', color: '#F59E0B', marginLeft: '6px', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Borderline Overweight</span>
            </div>
          </div>
        </div>

        {/* Habit Trackers */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #F3F4F6', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.1rem', marginBottom: '20px', color: '#111827' }}>Daily Habits (Last 7 Days)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) repeat(7, 1fr)', gap: '12px', alignItems: 'center' }}>
            <div />
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>{day}</div>
            ))}

            <div style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>😴 Sleep</div>
            {mockHabitData.sleep.map((met, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: met ? '#10B981' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>{met ? '✓' : ''}</div>
              </div>
            ))}

            <div style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>💧 Water</div>
            {mockHabitData.water.map((met, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: met ? '#3B82F6' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>{met ? '✓' : ''}</div>
              </div>
            ))}

            <div style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>🏃 Exercise</div>
            {mockHabitData.exercise.map((met, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: met ? '#00D4AA' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>{met ? '✓' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

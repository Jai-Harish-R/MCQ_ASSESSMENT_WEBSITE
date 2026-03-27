'use client'

import { useState } from 'react'
import { generateDietPlan } from '@/lib/gemini'
import { mockNutritionSummary } from '@/lib/mock-data'

export default function DietPage() {
  const [generating, setGenerating] = useState(false)
  const [dietPlan, setDietPlan] = useState<any>(null)
  
  const handleGenerate = async () => {
    setGenerating(true)
    try {
      // Simulate Gemini call with mock fallback
      const plan = await generateDietPlan({ conditions: ['Hypertension', 'Pre-Diabetes'], medicines: [] }, ['Vegetarian'])
      setDietPlan(plan)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', padding: '28px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/patient/dashboard" style={{ textDecoration: 'none', color: '#6B7280', fontSize: '1.2rem' }}>←</a>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.6rem', color: '#111827' }}>My Diet Plan</h1>
        </div>

        {/* Nutrition Summary Bar */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #F3F4F6', marginBottom: '24px', display: 'flex', gap: '32px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderRight: '1px solid #E5E7EB', paddingRight: '32px', flex: 1 }}>
            <div style={{ fontSize: '2rem' }}>🥗</div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Target</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', fontFamily: 'Sora, sans-serif' }}>1,800 <span style={{ fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 400 }}>kcal</span></p>
            </div>
          </div>
          
          {[
            { label: 'Calories', current: mockNutritionSummary.calories.current, target: mockNutritionSummary.calories.target, unit: 'kcal', color: '#00D4AA' },
            { label: 'Protein', current: mockNutritionSummary.protein.current, target: mockNutritionSummary.protein.target, unit: 'g', color: '#3B82F6' },
            { label: 'Sodium', current: mockNutritionSummary.sodium.current, target: mockNutritionSummary.sodium.target, unit: 'mg', color: '#EF4444', over: mockNutritionSummary.sodium.over },
            { label: 'Sugar', current: mockNutritionSummary.sugar.current, target: mockNutritionSummary.sugar.target, unit: 'g', color: '#F59E0B' },
          ].map(n => {
            const pct = Math.min(100, (n.current / n.target) * 100)
            return (
              <div key={n.label} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#4B5563', fontWeight: 600 }}>{n.label}</span>
                  <span style={{ fontSize: '0.75rem', color: n.over ? '#EF4444' : '#6B7280', fontFamily: 'JetBrains Mono, monospace', fontWeight: n.over ? 700 : 400 }}>
                    {n.current}/{n.target}{n.unit} {n.over && '⚠️'}
                  </span>
                </div>
                <div style={{ background: '#F3F4F6', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: n.color, width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* AI Generator Box */}
        {!dietPlan && (
          <div style={{
            background: 'linear-gradient(135deg, #0A0F2C 0%, #1a2456 100%)',
            borderRadius: '20px', padding: '36px', color: 'white',
            boxShadow: '0 8px 30px rgba(10,15,44,0.15)', textAlign: 'center',
            marginBottom: '32px', position: 'relative', overflow: 'hidden',
          }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.4rem', marginBottom: '12px' }}>AI Medical Diet Generator</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 24px' }}>
              We'll generate a personalized 7-day Indian meal plan based on your Hypertension and Pre-Diabetes profile. Calorie and sodium-controlled.
            </p>
            {generating ? (
              <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#00D4AA', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: '#00D4AA', fontWeight: 600 }}>Generating with Gemini AI...</span>
              </div>
            ) : (
              <button onClick={handleGenerate} style={{
                background: 'linear-gradient(135deg, #00D4AA, #00A885)', color: 'white',
                border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,212,170,0.4)', transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Generate 7-Day Plan
              </button>
            )}
          </div>
        )}

        {/* Generated Plan */}
        {dietPlan && (
          <div style={{ animation: 'fade-in 0.5s ease-out' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.2rem', color: '#111827', marginBottom: '16px' }}>Your 7-Day Plan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dietPlan.days.map((day: any) => (
                <div key={day.day} style={{ background: 'white', borderRadius: '16px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
                  <div style={{ background: '#F9FAFB', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>Day {day.day} — {day.dayName}</h3>
                    <button style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Edit Plan</button>
                  </div>
                  <div style={{ padding: '16px 24px' }}>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <tbody>
                        {[
                          { slot: '🌅 Breakfast', time: '8:00 AM', meal: day.meals.breakfast },
                          { slot: '☀️ Lunch', time: '1:00 PM', meal: day.meals.lunch },
                          { slot: '☕ Snack', time: '4:00 PM', meal: day.meals.snack },
                          { slot: '🌙 Dinner', time: '7:30 PM', meal: day.meals.dinner },
                        ].map((m, i) => (
                          <tr key={i} style={{ borderBottom: i === 3 ? 'none' : '1px solid #F3F4F6' }}>
                            <td style={{ padding: '16px 0', width: '25%', verticalAlign: 'top' }}>
                              <p style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{m.slot}</p>
                              <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{m.time}</p>
                            </td>
                            <td style={{ padding: '16px 0', width: '50%' }}>
                              <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{m.meal.name}</p>
                              <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                                🔥 {m.meal.calories} kcal &nbsp; • &nbsp; 🥩 {m.meal.protein} &nbsp; • &nbsp; 🧂 {m.meal.sodium}
                              </p>
                            </td>
                            <td style={{ padding: '16px 0', width: '25%', textAlign: 'right', verticalAlign: 'middle' }}>
                              <button style={{ background: 'rgba(0,212,170,0.1)', color: '#00A885', border: '1px solid rgba(0,212,170,0.2)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                ✓ Log Meal
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

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

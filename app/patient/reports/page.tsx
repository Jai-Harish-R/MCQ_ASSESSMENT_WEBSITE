'use client'

import { useState } from 'react'
import { toBase64 } from '@/lib/utils'
import { analyzeMedicalReport } from '@/lib/gemini'
import BiomarkerCard from '@/components/health/BiomarkerCard'
import { mockBiomarkers } from '@/lib/mock-data'

export default function ReportsPage() {
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showSummarySent, setShowSummarySent] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    // Simulated upload to Supabase Storage
    await new Promise(r => setTimeout(r, 1500))
    setUploading(false)
    
    setAnalyzing(true)
    try {
      const base64 = await toBase64(file)
      const result = await analyzeMedicalReport(base64, file.type)
      setAnalysisResult(result)
    } catch (e) {
      console.error(e)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSendSummary = async () => {
    setShowSummarySent(true)
    // Here we'd compile the summary and send to /api/summaries/send-to-doctor
    setTimeout(() => setShowSummarySent(false), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', padding: '28px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <a href="/patient/dashboard" style={{ textDecoration: 'none', color: '#6B7280', fontSize: '1.2rem' }}>←</a>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.6rem', color: '#111827' }}>My Reports</h1>
        </div>

        {/* Upload Zone */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '36px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px dashed #D1D5DB',
          textAlign: 'center', marginBottom: '32px', position: 'relative',
          overflow: 'hidden',
        }}>
          {uploading || analyzing ? (
            <div style={{ padding: '20px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'spin 1.5s linear infinite text-teal-500' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #F3F4F6', borderTopColor: '#00D4AA', margin: '0 auto' }} />
              </div>
              <p style={{ color: '#111827', fontWeight: 600, fontSize: '1.1rem' }}>
                {uploading ? 'Uploading your report securely...' : 'Analyzing report with Gemini AI...'}
              </p>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '8px' }}>
                {analyzing ? 'Extracting biomarkers and checking for risks.' : 'Encrypting and saving...'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.2rem', color: '#111827', marginBottom: '8px' }}>
                Upload Lab Report
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '24px' }}>
                Upload a printed or handwritten report (JPG, PNG, PDF).<br/>
                Our AI will extract the data instantly.
              </p>
              <label style={{
                background: '#111827', color: 'white', fontWeight: 600,
                padding: '12px 28px', borderRadius: '12px', cursor: 'pointer',
                display: 'inline-block', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1F2937'}
              onMouseLeave={e => e.currentTarget.style.background = '#111827'}
              >
                Select File
                <input type="file" accept="image/jpeg, image/png, application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </>
          )}
        </div>

        {/* Analysis Result */}
        {analysisResult && (
          <div style={{ animation: 'fade-in 0.6s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.2rem', color: '#111827' }}>
                Extracted Biomarkers
              </h2>
              {analysisResult.overall_risk === 'CRITICAL' || analysisResult.overall_risk === 'HIGH' ? (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                  🚨 High Risk Detected
                </div>
              ) : (
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#10B981', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                  ✅ Generally Stable
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
              {analysisResult.biomarkers.map((b: any, i: number) => (
                <BiomarkerCard
                  key={i}
                  label={b.name}
                  value={b.value}
                  status={b.status}
                  normal={b.normal_range}
                  explanation={b.plain_explanation}
                />
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #0A0F2C 0%, #1a2456 100%)',
              borderRadius: '20px', padding: '32px', color: 'white',
              boxShadow: '0 8px 30px rgba(10,15,44,0.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.2rem', marginBottom: '8px', color: '#E0E7FF' }}>
                    Send Summary to Doctor
                  </h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.9rem', maxWidth: '500px' }}>
                    Share these results along with your 6-month trend and current medicines to Dr. Ravi Kumar. Our AI will include a clinical pre-visit note.
                  </p>
                </div>
                {showSummarySent ? (
                  <div style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, border: '1px solid currentColor', animation: 'bounce-in 0.4s ease-out' }}>
                    ✓ Summary Sent
                  </div>
                ) : (
                  <button onClick={handleSendSummary} style={{
                    background: 'linear-gradient(135deg, #00D4AA, #00A885)', color: 'white',
                    border: 'none', padding: '12px 28px', borderRadius: '12px', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,212,170,0.3)', transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Send to Doctor
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Previous Reports (Mock) */}
        {!analysisResult && (
          <div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.2rem', color: '#111827', marginBottom: '16px' }}>
              Past Reports
            </h2>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
              {[
                { date: 'Feb 12, 2026', title: 'Complete Blood Count (CBC)', uploadedBy: 'You', status: 'Reviewed' },
                { date: 'Jan 05, 2026', title: 'Prescription Update', uploadedBy: 'Dr. Ravi Kumar', status: 'New' },
                { date: 'Nov 20, 2025', title: 'Lipid Profile', uploadedBy: 'You', status: 'Reviewed' },
              ].map((r, i) => (
                <div key={i} style={{
                  padding: '16px 24px', borderBottom: i === 2 ? 'none' : '1px solid #F3F4F6',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <h4 style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{r.title}</h4>
                    <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '2px' }}>
                      {r.date} • Uploaded by {r.uploadedBy}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {r.status === 'New' && (
                      <span style={{ background: '#EFF6FF', color: '#3B82F6', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>NEW</span>
                    )}
                    <button style={{ color: '#6366F1', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>View</button>
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

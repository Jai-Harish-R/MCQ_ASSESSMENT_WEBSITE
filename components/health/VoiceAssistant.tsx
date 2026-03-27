'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { processVoiceCommand } from '@/app/actions/voice'

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle')
  const recognitionRef = useRef<any>(null)
  const router = useRouter()

  // Track if component is mounted to prevent hydration errors
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setStatus('listening')
        setTranscript('')
      }

      recognition.onresult = async (event: any) => {
        const text = event.results[0][0].transcript
        setTranscript(text)
        setStatus('processing')
        
        try {
          const intent = await processVoiceCommand(text)
          
          switch(intent) {
            case 'DASHBOARD':
            case 'HOME':
              router.push('/patient/dashboard')
              break
            case 'REPORT_SCANNER':
              router.push('/patient/reports')
              break
            case 'FOOD_SCANNER':
              router.push('/patient/diet')
              break
            case 'PROGRESS':
              router.push('/patient/progress')
              break
            case 'SOS':
              router.push('/patient/sos')
              break
            case 'PROFILE':
              router.push('/patient/profile')
              break
            case 'DOCTOR':
              router.push('/doctor/dashboard')
              break
            default:
              console.log('Voice intent not recognized:', intent)
              setStatus('error')
              setTimeout(() => setStatus('idle'), 3000)
              setIsListening(false)
              return
          }
          setStatus('idle')
        } catch(e) {
          console.error(e)
          setStatus('error')
          setTimeout(() => setStatus('idle'), 3000)
        } finally {
          setIsListening(false)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }

      recognition.onend = () => {
        setIsListening(false)
        setStatus((prev) => (prev === 'listening' ? 'idle' : prev))
      }

      recognitionRef.current = recognition
    }
  }, [router])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  // Only render on client and if Speech Web API is available
  if (!mounted || !recognitionRef.current) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Status Card */}
      {status !== 'idle' && (
        <div className="bg-surface-container-highest border border-outline-variant/30 text-on-surface p-4 rounded-2xl shadow-2xl max-w-xs min-w-[240px] pointer-events-auto animate-fade-in backdrop-blur-xl">
          {status === 'listening' && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span className="font-label font-bold text-xs uppercase text-error tracking-wider">Listening...</span>
              <span className="material-symbols-outlined ml-auto text-outline text-sm">graphic_eq</span>
            </div>
          )}
          
          {status === 'processing' && (
            <div>
              <p className="font-body text-sm text-primary italic mb-3">"{transcript}"</p>
              <div className="flex items-center gap-2 text-outline bg-surface-container-low p-2 rounded-lg">
                <span className="material-symbols-outlined text-[14px] animate-spin text-primary">sync</span>
                <span className="font-label text-[10px] uppercase font-bold tracking-widest text-[#c0c1ff]">Gemini AI Routing</span>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span className="font-label text-[10px] font-medium uppercase tracking-wider">Command not recognized</span>
            </div>
          )}
        </div>
      )}

      {/* Mic Button */}
      <button 
        onClick={toggleListening}
        className={`pointer-events-auto h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
          isListening 
            ? 'bg-error-container text-on-error-container border-error shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse-ring' 
            : 'bg-primary text-on-primary border-primary hover:shadow-[0_10px_40px_rgba(70,241,197,0.4)]'
        }`}
      >
        <span className="material-symbols-outlined text-3xl">
          {isListening ? 'mic' : 'mic_none'}
        </span>
      </button>

    </div>
  )
}

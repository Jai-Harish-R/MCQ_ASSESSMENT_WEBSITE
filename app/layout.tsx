import type { Metadata } from 'next'
import './globals.css'
import VoiceAssistant from '@/components/health/VoiceAssistant'

export const metadata: Metadata = {
  title: 'VitalSync — Your Health, Intelligently Managed',
  description: 'AI-powered health platform connecting patients, caregivers, and doctors. Gemini-powered report analysis, food scanning, and real-time health monitoring.',
  keywords: 'health, AI, medical, patient, doctor, caregiver, Gemini, health monitoring',
  openGraph: {
    title: 'VitalSync',
    description: 'Bridging the gap between clinical data and everyday wellness through Multimodal AI.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
        {children}
        <VoiceAssistant />
      </body>
    </html>
  )
}

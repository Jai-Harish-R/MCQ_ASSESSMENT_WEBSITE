import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  if (hour < 21) return 'Good Evening'
  return 'Good Night'
}

export function getMedicineTimeSlot(): 'morning' | 'afternoon' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'night'
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function getRiskColor(risk: string): string {
  switch (risk?.toLowerCase()) {
    case 'critical': return '#EF4444'
    case 'high': return '#EF4444'
    case 'moderate': return '#F59E0B'
    case 'borderline': return '#F59E0B'
    case 'low': return '#10B981'
    case 'normal': return '#10B981'
    default: return '#6B7280'
  }
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

export function getHealthScoreColor(score: number): string {
  if (score >= 70) return '#00D4AA'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

export function computeHealthScore(params: {
  medicineAdherence: number
  vitalStability: number
  reportTrend: number
  dietCompliance: number
}): number {
  const { medicineAdherence, vitalStability, reportTrend, dietCompliance } = params
  return Math.round(
    medicineAdherence * 0.35 +
    vitalStability * 0.30 +
    reportTrend * 0.20 +
    dietCompliance * 0.15
  )
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
  })
}

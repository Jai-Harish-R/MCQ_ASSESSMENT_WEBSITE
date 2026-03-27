'use server'

import { classifyVoiceCommand } from '@/lib/gemini'

export async function processVoiceCommand(transcript: string) {
  return await classifyVoiceCommand(transcript)
}

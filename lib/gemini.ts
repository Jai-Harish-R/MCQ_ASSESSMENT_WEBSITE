import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.GEMINI_API_KEY || ''

function getGenAI() {
  if (!API_KEY) return null
  return new GoogleGenerativeAI(API_KEY)
}

export interface MedicalProfile {
  conditions: string[]
  medicines: string[]
  age?: number
}

export interface BiomarkerResult {
  name: string
  value: string
  status: 'HIGH' | 'LOW' | 'NORMAL' | 'CRITICAL' | 'BORDERLINE'
  normal_range: string
  plain_explanation: string
  risk_flag: boolean
}

export interface ReportAnalysis {
  biomarkers: BiomarkerResult[]
  detected_conditions: string[]
  overall_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
}

export interface FoodScanResult {
  items: Array<{ name: string; calories: number; sodium_mg: number; sugar_g: number; fat_g: number }>
  total: { calories: number; sodium_mg: number; sugar_g: number; fat_g: number }
  recommendation: 'EAT' | 'LIMIT' | 'AVOID'
  reason: string
  alternatives: string[]
}

export interface ClinicalSummary {
  summary: string
  concerns: string[]
  trend: 'Improving' | 'Stable' | 'Declining'
}

export interface DietPlan {
  days: Array<{
    day: number
    dayName: string
    meals: {
      breakfast: { name: string; calories: number; protein: string; sodium: string; tip?: string; time?: string }
      lunch: { name: string; calories: number; protein: string; sodium: string; tip?: string; time?: string }
      dinner: { name: string; calories: number; protein: string; sodium: string; tip?: string; time?: string }
      snack: { name: string; calories: number; protein: string; sodium: string; tip?: string; time?: string }
    }
  }>
}

// ─── Mock fallbacks ───────────────────────────────────────────────────
function getMockReportAnalysis(): ReportAnalysis {
  return {
    biomarkers: [
      { name: 'HbA1c', value: '7.2%', status: 'HIGH', normal_range: '4–5.6%', plain_explanation: 'Your 3-month average blood sugar is too high. It means sugar has been elevated for a while — bringing this below 7% can reduce complications by 40%.', risk_flag: true },
      { name: 'LDL Cholesterol', value: '142 mg/dL', status: 'HIGH', normal_range: '<100 mg/dL', plain_explanation: 'Bad cholesterol is elevated, increasing heart disease risk over time. Diet changes like cutting saturated fats can help significantly.', risk_flag: true },
      { name: 'Hemoglobin', value: '13.2 g/dL', status: 'NORMAL', normal_range: '12–17.5 g/dL', plain_explanation: 'Your blood hemoglobin is healthy — your blood is carrying oxygen well. Keep it up!', risk_flag: false },
      { name: 'Creatinine', value: '1.1 mg/dL', status: 'NORMAL', normal_range: '0.7–1.3 mg/dL', plain_explanation: 'Kidney function looks normal. Stay hydrated and maintain this.', risk_flag: false },
    ],
    detected_conditions: ['Early Pre-Diabetes', 'Mild Dyslipidemia'],
    overall_risk: 'MODERATE',
  }
}

function getMockFoodScan(): FoodScanResult {
  return {
    items: [
      { name: 'White Rice', calories: 240, sodium_mg: 10, sugar_g: 0, fat_g: 0.5 },
      { name: 'Soy Sauce', calories: 5, sodium_mg: 870, sugar_g: 0.5, fat_g: 0 },
      { name: 'Boiled Egg', calories: 78, sodium_mg: 62, sugar_g: 0, fat_g: 5 },
    ],
    total: { calories: 323, sodium_mg: 942, sugar_g: 0.5, fat_g: 5.5 },
    recommendation: 'LIMIT',
    reason: 'High sodium (942mg) conflicts with Stage 1 Hypertension management. Recommended daily limit is 1500mg.',
    alternatives: ['Brown rice instead of white rice', 'Reduced-sodium soy sauce', 'Lemon juice for flavor instead of soy sauce'],
  }
}

function getMockClinicalSummary(): ClinicalSummary {
  return {
    summary: 'Patient presents with Stage 1 Hypertension and Pre-Diabetes showing gradual improvement over 6 months. HbA1c trending downward from 8.1% to 7.2%, indicating positive response to Metformin therapy. BP remains mildly elevated at 128/84 despite Amlodipine 5mg. Medicine adherence at 82% — acceptable but room for improvement.',
    concerns: [
      'Discuss HbA1c target: aim for <6.5% within 6 months, evaluate Metformin dose increase',
      'BP control: consider adding ARB if systolic remains >130 at next visit',
      'LDL at 142 mg/dL — evaluate need for statin therapy',
    ],
    trend: 'Improving',
  }
}

// ─── Gemini API Functions ─────────────────────────────────────────────
export async function analyzeMedicalReport(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<ReportAnalysis> {
  const genAI = getGenAI()
  if (!genAI) return getMockReportAnalysis()

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent([
      {
        inlineData: { mimeType, data: imageBase64 },
      },
      `Act as a medical data parser. Analyze this medical report image and extract ALL biomarkers found.
For each biomarker, provide:
- name (string)
- value (string with unit)
- status: "HIGH" | "LOW" | "NORMAL" | "CRITICAL" | "BORDERLINE"
- normal_range (string)
- plain_explanation (explain in simple language a 12-year-old can understand, 2 sentences max)
- risk_flag: boolean (true if requires doctor attention)

Also identify any overall conditions detectable (e.g., "Early Pre-Diabetes", "Hypertension").
Output ONLY a valid JSON object. No markdown. No preamble.
Schema: { "biomarkers": [...], "detected_conditions": [...], "overall_risk": "LOW"|"MODERATE"|"HIGH"|"CRITICAL" }`,
    ])
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(text)
  } catch (e) {
    console.error('Gemini report analysis error:', e)
    return getMockReportAnalysis()
  }
}

export async function analyzeFoodImage(imageBase64: string, medicalProfile: MedicalProfile): Promise<FoodScanResult> {
  const genAI = getGenAI()
  if (!genAI) return getMockFoodScan()

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      `You are a clinical nutritionist AI. Analyze this food image. Identify all visible food items.
Patient medical profile:
- Conditions: ${medicalProfile.conditions.join(', ')}
- Medicines: ${medicalProfile.medicines.join(', ')}

For each food item, estimate: calories, sodium_mg, sugar_g, fat_g.
Then give an overall recommendation: "EAT" | "LIMIT" | "AVOID"
With a specific reason referencing the patient's conditions.

Output ONLY valid JSON:
{ "items": [{ "name": string, "calories": number, "sodium_mg": number, "sugar_g": number, "fat_g": number }],
  "total": { "calories": number, "sodium_mg": number, "sugar_g": number, "fat_g": number },
  "recommendation": "EAT"|"LIMIT"|"AVOID",
  "reason": string,
  "alternatives": string[] }`,
    ])
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(text)
  } catch (e) {
    console.error('Gemini food scan error:', e)
    return getMockFoodScan()
  }
}

export async function generateClinicalSummary(patientData: {
  name: string
  age: number
  conditions: string[]
  biomarkerHistory: Record<string, number[]>
  medicines: Array<{ name: string; dosage: string; frequency: string }>
  adherencePercent: number
  foodFlags: string[]
}): Promise<ClinicalSummary> {
  const genAI = getGenAI()
  if (!genAI) return getMockClinicalSummary()

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    const result = await model.generateContent(`
Generate a clinical pre-visit summary for a doctor.

Patient: ${patientData.name}, Age: ${patientData.age}
Conditions: ${patientData.conditions.join(', ')}
Last 6 months biomarker trend: ${JSON.stringify(patientData.biomarkerHistory)}
Current medications: ${patientData.medicines.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join(', ')}
Medicine adherence: ${patientData.adherencePercent}%
Recent food scan flags: ${patientData.foodFlags.join(', ')}

Generate:
1. A concise clinical summary (3–4 sentences, medical terminology appropriate for a doctor)
2. Top 3 "Concerns to Discuss" as bullet points
3. A trend assessment: "Improving" | "Stable" | "Declining"

Output as JSON: { "summary": string, "concerns": string[], "trend": "Improving"|"Stable"|"Declining" }`)
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(text)
  } catch (e) {
    console.error('Gemini summary error:', e)
    return getMockClinicalSummary()
  }
}

export async function generateDietPlan(profile: MedicalProfile, preferences: string[] = []): Promise<DietPlan> {
  const genAI = getGenAI()
  if (!genAI) {
    const { mockDietPlan } = await import('./mock-data')
    return mockDietPlan as DietPlan
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    const result = await model.generateContent(`
Generate a 7-day Indian diet plan for:
Conditions: ${profile.conditions.join(', ')}
Restrictions: ${preferences.join(', ') || 'None specified'}
Target: Calorie controlled (1600–1800 kcal/day), low sodium (<1500mg), balanced macros

For each day provide breakfast, lunch, dinner, snacks.
Each meal: name, calories (number), protein (string with g), sodium (string with mg), tip (cooking/prep tip).

Output ONLY valid JSON:
{ "days": [{ "day": 1, "dayName": "Monday", "meals": { "breakfast": {...}, "lunch": {...}, "dinner": {...}, "snack": {...} } }] }`)
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(text)
  } catch (e) {
    console.error('Gemini diet plan error:', e)
    const { mockDietPlan } = await import('./mock-data')
    return mockDietPlan as DietPlan
  }
}

// ─── Voice Navigation ─────────────────────────────────────────────────
export async function classifyVoiceCommand(transcript: string): Promise<string> {
  const genAI = getGenAI()
  if (!genAI) {
    const lower = transcript.toLowerCase()
    if (lower.includes('food') || lower.includes('plate') || lower.includes('meal') || lower.includes('diet')) return 'FOOD_SCANNER'
    if (lower.includes('report') || lower.includes('ocr') || lower.includes('lab')) return 'REPORT_SCANNER'
    if (lower.includes('progress') || lower.includes('chart') || lower.includes('history')) return 'PROGRESS'
    if (lower.includes('sos') || lower.includes('emergency') || lower.includes('help')) return 'SOS'
    if (lower.includes('profile') || lower.includes('settings')) return 'PROFILE'
    if (lower.includes('doctor') || lower.includes('physician')) return 'DOCTOR'
    if (lower.includes('home') || lower.includes('dashboard') || lower.includes('overview')) return 'DASHBOARD'
    return 'UNKNOWN'
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `You are a voice assistant router for a healthcare app.
Analyze the user's transcript and map it to ONE of the following precise navigation intents:
"DASHBOARD" (go to main screen, home, overview)
"REPORT_SCANNER" (upload report, scan lab results, medical records)
"FOOD_SCANNER" (scan food, log meal, diet plan, food camera)
"PROGRESS" (view charts, vital history, progress)
"SOS" (emergency, help, sos, critical condition)
"PROFILE" (settings, account, my doctor)
"DOCTOR" (switch to doctor dashboard, clinic portal)
"UNKNOWN" (if it doesn't match any clearly)

Transcript: "${transcript}"

Output ONLY the exact intent keyword (e.g. DASHBOARD) with no markdown, quotes, or extra text.`

    const result = await model.generateContent(prompt)
    return result.response.text().trim().toUpperCase()
  } catch (e) {
    console.error('Gemini voice classification error:', e)
    return 'UNKNOWN'
  }
}

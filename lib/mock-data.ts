// Mock data for preview/demo when Supabase/Gemini not configured

export const mockPatient = {
  id: 'patient-001',
  full_name: 'Priya Sharma',
  role: 'patient' as const,
  age: 42,
  language: 'en',
  theme: 'light',
  medical_conditions: ['Hypertension Stage 1', 'Pre-Diabetes'],
  linked_doctor_id: 'doctor-001',
  linked_caregiver_ids: ['caregiver-001'],
  avatar_url: null,
}

export const mockDoctor = {
  id: 'doctor-001',
  full_name: 'Dr. Ravi Kumar',
  role: 'doctor' as const,
  specialization: 'Internal Medicine',
  avatar_url: null,
}

export const mockCaregiver = {
  id: 'caregiver-001',
  full_name: 'Anita Sharma',
  role: 'caregiver' as const,
  avatar_url: null,
}

export const mockVitals = {
  blood_pressure: { systolic: 128, diastolic: 84, trend: '↑ 3%', status: 'warning' },
  blood_sugar: { value: 145, unit: 'mg/dL', trend: '↓ 5%', status: 'warning' },
  heart_rate: { value: 78, unit: 'bpm', trend: '→ stable', status: 'normal' },
  weight: { value: 72.4, unit: 'kg', trend: '↓ 0.8kg', status: 'normal' },
}

export const mockSparklines = {
  bp: [122, 130, 125, 132, 128, 135, 128],
  sugar: [155, 148, 160, 142, 150, 138, 145],
  hr: [80, 76, 82, 75, 79, 77, 78],
  weight: [73.2, 73.0, 72.8, 72.6, 72.5, 72.4, 72.4],
}

export const mockMedicines = [
  { id: 'm1', name: 'Metformin', dosage: '500mg', times: ['morning', 'night'], status: 'pending', streak: 5 },
  { id: 'm2', name: 'Amlodipine', dosage: '5mg', times: ['morning'], status: 'taken', streak: 5 },
  { id: 'm3', name: 'Atorvastatin', dosage: '10mg', times: ['night'], status: 'pending', streak: 3 },
  { id: 'm4', name: 'Losartan', dosage: '50mg', times: ['afternoon'], status: 'taken', streak: 7 },
]

export const mockHealthScore = {
  score: 74,
  label: 'Good',
  breakdown: {
    medicineAdherence: 82,
    vitalStability: 68,
    reportTrend: 71,
    dietCompliance: 75,
  },
}

export const mockBiomarkers = [
  { label: 'HbA1c', value: '7.2%', status: 'HIGH', normal: '4–5.6%', explanation: 'Your 3-month average blood sugar is too high. This puts you in early diabetes territory, but it\'s reversible with diet and medication.' },
  { label: 'LDL Cholesterol', value: '142 mg/dL', status: 'HIGH', normal: '<100 mg/dL', explanation: 'Bad cholesterol is elevated. This increases risk of heart disease over time. Diet changes can help a lot.' },
  { label: 'Hemoglobin', value: '13.2 g/dL', status: 'NORMAL', normal: '12–17.5 g/dL', explanation: 'Your blood hemoglobin is in the healthy range. This means your blood is carrying oxygen well.' },
  { label: 'Creatinine', value: '1.1 mg/dL', status: 'NORMAL', normal: '0.7–1.3 mg/dL', explanation: 'Kidney function looks normal. Keep staying hydrated.' },
  { label: 'BP Systolic', value: '128 mmHg', status: 'BORDERLINE', normal: '<120 mmHg', explanation: 'Your blood pressure is slightly elevated. Reduce salt intake and stress.' },
  { label: 'Triglycerides', value: '185 mg/dL', status: 'BORDERLINE', normal: '<150 mg/dL', explanation: 'Blood fat levels are a bit high. Cut back on sugary foods and refined carbs.' },
]

export const mockTimeline = [
  { date: 'Mar 27', event: 'Blood report uploaded', detail: 'HbA1c: 7.2% (High)', icon: '📄', type: 'report' },
  { date: 'Mar 24', event: 'Food scan: Biryani', detail: 'High sodium warning ⚠️', icon: '🍛', type: 'food' },
  { date: 'Mar 20', event: 'Doctor summary received', detail: 'Dr. Ravi Kumar', icon: '👨‍⚕️', type: 'doctor' },
  { date: 'Mar 15', event: 'Medicine streak', detail: '10 days 🏆', icon: '🔥', type: 'achievement' },
  { date: 'Mar 12', event: 'Vitals logged', detail: 'BP: 130/86 ⚠️', icon: '💓', type: 'vital' },
  { date: 'Mar 08', event: 'Food scan: Dal Rice', detail: 'Healthy choice ✅', icon: '🍽️', type: 'food' },
]

export const mockGoals = {
  water: { current: 6, target: 8, unit: 'glasses' },
  steps: { current: 4200, target: 8000, unit: 'steps' },
  medicine: { current: 2, target: 3, unit: 'doses' },
  sleep: { current: 7.2, target: 8, unit: 'hrs' },
}

export const mockDietPlan = {
  days: [
    {
      day: 1,
      dayName: 'Monday',
      meals: {
        breakfast: { name: 'Oats + Banana + Green Tea', calories: 320, protein: '8g', sodium: '120mg', time: '8:00 AM' },
        lunch: { name: 'Brown Rice + Dal + Salad', calories: 540, protein: '18g', sodium: '420mg', time: '1:00 PM' },
        dinner: { name: 'Chapati + Sabzi + Curd', calories: 480, protein: '14g', sodium: '380mg', time: '7:30 PM' },
        snack: { name: 'Almonds + Fruit', calories: 180, protein: '5g', sodium: '10mg', time: '4:00 PM' },
      },
    },
    {
      day: 2,
      dayName: 'Tuesday',
      meals: {
        breakfast: { name: 'Idli + Sambar + Coconut Chutney', calories: 350, protein: '10g', sodium: '280mg', time: '8:00 AM' },
        lunch: { name: 'Ragi Roti + Palak Dal + Cucumber', calories: 520, protein: '16g', sodium: '380mg', time: '1:00 PM' },
        dinner: { name: 'Khichdi + Raita', calories: 450, protein: '12g', sodium: '320mg', time: '7:30 PM' },
        snack: { name: 'Roasted Chana + Buttermilk', calories: 160, protein: '8g', sodium: '90mg', time: '4:00 PM' },
      },
    },
  ],
}

export const mockNutritionSummary = {
  calories: { current: 1340, target: 1800, unit: 'kcal' },
  protein: { current: 42, target: 60, unit: 'g' },
  sodium: { current: 1820, target: 1500, unit: 'mg', over: true },
  sugar: { current: 18, target: 25, unit: 'g' },
}

export const mockPatients = [
  {
    id: 'patient-001',
    name: 'Radha Devi',
    age: 65,
    conditions: ['Hypertension', 'Diabetes'],
    healthScore: 42,
    lastSeen: '2 hours ago',
    alerts: 2,
    medicineAdherence: 58,
    status: 'critical',
    isPinned: true,
    pinReason: 'SOS triggered',
    latestVitals: { bp: '182/112', sugar: 310 },
  },
  {
    id: 'patient-002',
    name: 'Priya Sharma',
    age: 42,
    conditions: ['Hypertension Stage 1', 'Pre-Diabetes'],
    healthScore: 74,
    lastSeen: '1 hour ago',
    alerts: 1,
    medicineAdherence: 82,
    status: 'warning',
    isPinned: true,
    pinReason: 'Summary received',
    latestVitals: { bp: '128/84', sugar: 145 },
  },
  {
    id: 'patient-003',
    name: 'Mohan Kumar',
    age: 55,
    conditions: ['Hypothyroidism'],
    healthScore: 88,
    lastSeen: '3 days ago',
    alerts: 0,
    medicineAdherence: 95,
    status: 'good',
    isPinned: false,
    pinReason: null,
    latestVitals: { bp: '118/76', sugar: 98 },
  },
  {
    id: 'patient-004',
    name: 'Lakshmi Reddy',
    age: 38,
    conditions: ['Anemia', 'PCOS'],
    healthScore: 79,
    lastSeen: '5 hours ago',
    alerts: 0,
    medicineAdherence: 88,
    status: 'good',
    isPinned: false,
    pinReason: null,
    latestVitals: { bp: '112/70', sugar: 102 },
  },
]

export const mockMessages = [
  {
    id: 'msg-001',
    sender: 'system',
    type: 'sos_alert',
    content: "🚨 SYSTEM: Patient's BP (182/112) exceeds critical threshold. Report uploaded at 2:14 PM.",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    patientId: 'patient-001',
  },
  {
    id: 'msg-002',
    sender: 'doctor-001',
    type: 'message',
    content: 'Radha, please reduce salt intake immediately and rest. I\'ve updated your prescription.',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-003',
    sender: 'patient-001',
    type: 'message',
    content: 'Okay doctor, will follow. Thank you.',
    timestamp: new Date(Date.now() - 30000),
    isRead: true,
  },
  {
    id: 'msg-004',
    sender: 'system',
    type: 'summary',
    content: "📋 Priya's 6-month summary received. HbA1c trend: 8.1 → 7.6 → 7.2 ↓ (improving). BP: Stable.",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    patientId: 'patient-002',
  },
]

export const mockCaregiverAlerts = [
  {
    id: 'alert-001',
    severity: 'critical',
    message: "Radha's BP: 182/112 — Critical threshold exceeded",
    patientId: 'patient-001',
    patientName: 'Radha Devi',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    action: 'view',
  },
  {
    id: 'alert-002',
    severity: 'warning',
    message: 'Radha missed evening medicine: Metformin 500mg',
    patientId: 'patient-001',
    patientName: 'Radha Devi',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    action: 'view',
  },
  {
    id: 'alert-003',
    severity: 'info',
    message: "Priya's morning medicine taken ✓",
    patientId: 'patient-002',
    patientName: 'Priya Sharma',
    timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000),
    action: null,
  },
]

export const mockBPHistory = [
  { date: 'Oct', systolic: 138, diastolic: 90 },
  { date: 'Nov', systolic: 135, diastolic: 88 },
  { date: 'Dec', systolic: 132, diastolic: 86 },
  { date: 'Jan', systolic: 134, diastolic: 87 },
  { date: 'Feb', systolic: 130, diastolic: 85 },
  { date: 'Mar', systolic: 128, diastolic: 84 },
]

export const mockSugarHistory = [
  { date: 'Mon', fasting: 135, postMeal: 185 },
  { date: 'Tue', fasting: 128, postMeal: 175 },
  { date: 'Wed', fasting: 142, postMeal: 195 },
  { date: 'Thu', fasting: 130, postMeal: 172 },
  { date: 'Fri', fasting: 138, postMeal: 182 },
  { date: 'Sat', fasting: 145, postMeal: 190 },
  { date: 'Sun', fasting: 132, postMeal: 178 },
]

export const mockStepsHistory = [
  { date: 'Mar 14', steps: 6200 },
  { date: 'Mar 15', steps: 8100 },
  { date: 'Mar 16', steps: 4800 },
  { date: 'Mar 17', steps: 7200 },
  { date: 'Mar 18', steps: 5600 },
  { date: 'Mar 19', steps: 9200 },
  { date: 'Mar 20', steps: 3800 },
  { date: 'Mar 21', steps: 6800 },
  { date: 'Mar 22', steps: 7400 },
  { date: 'Mar 23', steps: 5200 },
  { date: 'Mar 24', steps: 8800 },
  { date: 'Mar 25', steps: 6100 },
  { date: 'Mar 26', steps: 4200 },
  { date: 'Mar 27', steps: 4200 },
]

export const mockWeightHistory = [
  { date: 'Oct', weight: 75.2, bmi: 27.8 },
  { date: 'Nov', weight: 74.8, bmi: 27.6 },
  { date: 'Dec', weight: 74.2, bmi: 27.3 },
  { date: 'Jan', weight: 73.6, bmi: 27.1 },
  { date: 'Feb', weight: 73.0, bmi: 26.9 },
  { date: 'Mar', weight: 72.4, bmi: 26.6 },
]

export const mockHabitData = {
  sleep:    [true, true, false, true, true, true, false],
  water:    [true, false, true, true, true, false, true],
  exercise: [false, true, true, false, true, true, true],
}

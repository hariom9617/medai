export interface MockPatient {
  id: string;
  fullName: string;
  age: number;
  email: string;
  phone: string;
  avatarColor: string;
  adherenceRate: number;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  activeMedications: number;
  missedThisWeek: number;
  caregiver: string;
  doctor: string;
  nextDoseAt: string; // HH:mm
  nextMedication: string;
  lastActiveISO: string;
  conditions: string[];
  emergencyContact: string;
}

export interface MockMedication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  schedule: string[]; // times
  instructions: string;
  adherenceRate: number;
  daysLeft: number;
  type: "Prescription" | "Supplement" | "OTC";
}

export interface MockDose {
  id: string;
  patientId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledAt: string; // ISO
  status: "taken" | "missed" | "pending" | "delayed";
  takenAt?: string;
  assistedBy?: string;
}

export interface MockAlert {
  id: string;
  patientId: string;
  patientName: string;
  type:
    | "missed_dose"
    | "adherence_decline"
    | "high_risk"
    | "medication_conflict"
    | "emergency"
    | "doctor_message";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  aiExplanation?: string;
  recommendedAction?: string;
  createdAt: string;
  status: "active" | "resolved" | "escalated";
}

export interface MockAIPrediction {
  patientId: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  factors: { factor: string; weight: number; description: string }[];
  insight: string;
  recommendation: string;
  predictedRate7d: number;
}

export interface MockIntervention {
  id: string;
  patientId: string;
  patientName: string;
  type: "reminder_sent" | "caregiver_notified" | "schedule_adjusted" | "note_added";
  detail: string;
  by: string;
  at: string;
}

const isoHoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const isoMinutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const mockPatients: MockPatient[] = [
  {
    id: "p-001",
    fullName: "Margaret Thompson",
    age: 72,
    email: "margaret.t@example.com",
    phone: "+1 (415) 555-0123",
    avatarColor: "bg-rose-100 text-rose-700",
    adherenceRate: 62,
    riskLevel: "high",
    riskScore: 84,
    activeMedications: 5,
    missedThisWeek: 6,
    caregiver: "Sarah Johnson",
    doctor: "Dr. Patel",
    nextDoseAt: "18:00",
    nextMedication: "Metformin 500mg",
    lastActiveISO: isoMinutesAgo(42),
    conditions: ["Type 2 Diabetes", "Hypertension"],
    emergencyContact: "James Thompson (Son) · +1 (415) 555-0199",
  },
  {
    id: "p-002",
    fullName: "Robert Chen",
    age: 68,
    email: "robert.chen@example.com",
    phone: "+1 (415) 555-0145",
    avatarColor: "bg-amber-100 text-amber-700",
    adherenceRate: 78,
    riskLevel: "medium",
    riskScore: 56,
    activeMedications: 3,
    missedThisWeek: 3,
    caregiver: "Sarah Johnson",
    doctor: "Dr. Patel",
    nextDoseAt: "20:00",
    nextMedication: "Lisinopril 10mg",
    lastActiveISO: isoHoursAgo(2),
    conditions: ["Hypertension"],
    emergencyContact: "Linda Chen (Wife) · +1 (415) 555-0146",
  },
  {
    id: "p-003",
    fullName: "Eleanor Davis",
    age: 81,
    email: "eleanor.d@example.com",
    phone: "+1 (415) 555-0167",
    avatarColor: "bg-violet-100 text-violet-700",
    adherenceRate: 92,
    riskLevel: "low",
    riskScore: 22,
    activeMedications: 4,
    missedThisWeek: 1,
    caregiver: "Michael Brooks",
    doctor: "Dr. Patel",
    nextDoseAt: "19:30",
    nextMedication: "Atorvastatin 20mg",
    lastActiveISO: isoMinutesAgo(15),
    conditions: ["High Cholesterol", "Osteoporosis"],
    emergencyContact: "Mary Davis (Daughter) · +1 (415) 555-0168",
  },
  {
    id: "p-004",
    fullName: "Hiroshi Tanaka",
    age: 65,
    email: "h.tanaka@example.com",
    phone: "+1 (415) 555-0189",
    avatarColor: "bg-emerald-100 text-emerald-700",
    adherenceRate: 88,
    riskLevel: "low",
    riskScore: 28,
    activeMedications: 2,
    missedThisWeek: 1,
    caregiver: "Michael Brooks",
    doctor: "Dr. Patel",
    nextDoseAt: "21:00",
    nextMedication: "Aspirin 81mg",
    lastActiveISO: isoHoursAgo(1),
    conditions: ["Cardiac Prevention"],
    emergencyContact: "Yuki Tanaka (Wife) · +1 (415) 555-0190",
  },
  {
    id: "p-005",
    fullName: "Patricia Williams",
    age: 74,
    email: "p.williams@example.com",
    phone: "+1 (415) 555-0201",
    avatarColor: "bg-sky-100 text-sky-700",
    adherenceRate: 54,
    riskLevel: "high",
    riskScore: 91,
    activeMedications: 6,
    missedThisWeek: 8,
    caregiver: "Sarah Johnson",
    doctor: "Dr. Patel",
    nextDoseAt: "17:00",
    nextMedication: "Warfarin 2mg",
    lastActiveISO: isoHoursAgo(8),
    conditions: ["Atrial Fibrillation", "CHF"],
    emergencyContact: "Robert Williams (Husband) · +1 (415) 555-0202",
  },
  {
    id: "p-006",
    fullName: "Anthony Rivera",
    age: 59,
    email: "a.rivera@example.com",
    phone: "+1 (415) 555-0223",
    avatarColor: "bg-indigo-100 text-indigo-700",
    adherenceRate: 81,
    riskLevel: "medium",
    riskScore: 48,
    activeMedications: 3,
    missedThisWeek: 2,
    caregiver: "Michael Brooks",
    doctor: "Dr. Patel",
    nextDoseAt: "22:00",
    nextMedication: "Sertraline 50mg",
    lastActiveISO: isoMinutesAgo(90),
    conditions: ["Depression", "Insomnia"],
    emergencyContact: "Carla Rivera (Sister) · +1 (415) 555-0224",
  },
];

export const mockMedications: MockMedication[] = [
  { id: "m-1", patientId: "p-001", name: "Metformin", dosage: "500mg", schedule: ["08:00", "18:00"], instructions: "With meals", adherenceRate: 64, daysLeft: 21, type: "Prescription" },
  { id: "m-2", patientId: "p-001", name: "Lisinopril", dosage: "10mg", schedule: ["08:00"], instructions: "Morning", adherenceRate: 71, daysLeft: 14, type: "Prescription" },
  { id: "m-3", patientId: "p-001", name: "Atorvastatin", dosage: "20mg", schedule: ["21:00"], instructions: "Evening", adherenceRate: 58, daysLeft: 9, type: "Prescription" },
  { id: "m-4", patientId: "p-002", name: "Lisinopril", dosage: "10mg", schedule: ["20:00"], instructions: "Evening", adherenceRate: 80, daysLeft: 18, type: "Prescription" },
  { id: "m-5", patientId: "p-005", name: "Warfarin", dosage: "2mg", schedule: ["17:00"], instructions: "Same time daily", adherenceRate: 49, daysLeft: 11, type: "Prescription" },
];

function makeTodayISO(time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const mockTodayDoses: MockDose[] = [
  { id: "d-1", patientId: "p-001", medicationId: "m-1", medicationName: "Metformin", dosage: "500mg", scheduledAt: makeTodayISO("08:00"), status: "taken", takenAt: makeTodayISO("08:14"), assistedBy: "Sarah J." },
  { id: "d-2", patientId: "p-001", medicationId: "m-2", medicationName: "Lisinopril", dosage: "10mg", scheduledAt: makeTodayISO("08:00"), status: "missed" },
  { id: "d-3", patientId: "p-001", medicationId: "m-1", medicationName: "Metformin", dosage: "500mg", scheduledAt: makeTodayISO("18:00"), status: "pending" },
  { id: "d-4", patientId: "p-001", medicationId: "m-3", medicationName: "Atorvastatin", dosage: "20mg", scheduledAt: makeTodayISO("21:00"), status: "pending" },
  { id: "d-5", patientId: "p-002", medicationId: "m-4", medicationName: "Lisinopril", dosage: "10mg", scheduledAt: makeTodayISO("20:00"), status: "pending" },
  { id: "d-6", patientId: "p-005", medicationId: "m-5", medicationName: "Warfarin", dosage: "2mg", scheduledAt: makeTodayISO("17:00"), status: "delayed" },
];

export const mockAlerts: MockAlert[] = [
  {
    id: "a-1",
    patientId: "p-005",
    patientName: "Patricia Williams",
    type: "emergency",
    severity: "critical",
    title: "Warfarin dose missed — bleeding risk",
    message: "Patient missed 2 consecutive Warfarin doses. Anticoagulation may be sub-therapeutic.",
    aiExplanation: "AI detected dosing pattern break consistent with prior hospitalization risk window.",
    recommendedAction: "Contact patient immediately and notify cardiology.",
    createdAt: isoMinutesAgo(12),
    status: "active",
  },
  {
    id: "a-2",
    patientId: "p-001",
    patientName: "Margaret Thompson",
    type: "missed_dose",
    severity: "high",
    title: "3 missed doses this week",
    message: "Lisinopril skipped on Mon, Wed, Thu morning.",
    aiExplanation: "Morning routine disruption pattern detected.",
    recommendedAction: "Send reminder, consider schedule adjustment to evening.",
    createdAt: isoHoursAgo(2),
    status: "active",
  },
  {
    id: "a-3",
    patientId: "p-005",
    patientName: "Patricia Williams",
    type: "high_risk",
    severity: "high",
    title: "AI predicts 91% non-adherence risk",
    message: "Risk score increased from 78 to 91 over the past 7 days.",
    aiExplanation: "Decline triggered by 3 missed evenings and reduced app engagement.",
    recommendedAction: "Schedule intervention call.",
    createdAt: isoHoursAgo(5),
    status: "active",
  },
  {
    id: "a-4",
    patientId: "p-002",
    patientName: "Robert Chen",
    type: "adherence_decline",
    severity: "medium",
    title: "Adherence dropped 12% week-over-week",
    message: "From 90% to 78% adherence.",
    recommendedAction: "Send encouragement reminder.",
    createdAt: isoHoursAgo(14),
    status: "active",
  },
  {
    id: "a-5",
    patientId: "p-003",
    patientName: "Eleanor Davis",
    type: "doctor_message",
    severity: "low",
    title: "New care plan instructions",
    message: "Dr. Patel updated evening medication notes.",
    createdAt: isoHoursAgo(26),
    status: "resolved",
  },
  {
    id: "a-6",
    patientId: "p-001",
    patientName: "Margaret Thompson",
    type: "medication_conflict",
    severity: "medium",
    title: "Possible interaction detected",
    message: "Metformin + new OTC supplement may reduce absorption.",
    aiExplanation: "Drug-supplement interaction flagged by knowledge base.",
    recommendedAction: "Review supplement list with patient.",
    createdAt: isoHoursAgo(36),
    status: "active",
  },
];

export const mockPredictions: MockAIPrediction[] = mockPatients.map((p) => ({
  patientId: p.id,
  riskScore: p.riskScore,
  riskLevel: p.riskLevel,
  confidence: 0.78 + (p.id.charCodeAt(2) % 20) / 100,
  factors: [
    { factor: "Missed dose frequency", weight: 0.34, description: `${p.missedThisWeek} missed doses last 7 days` },
    { factor: "Time-of-day pattern", weight: 0.22, description: "Evening doses missed more often" },
    { factor: "Medication complexity", weight: 0.18, description: `${p.activeMedications} active medications` },
    { factor: "Engagement trend", weight: 0.14, description: "App opens declined 18% this week" },
    { factor: "Comorbidity load", weight: 0.12, description: `${p.conditions.length} chronic conditions` },
  ],
  insight:
    p.riskLevel === "high"
      ? "Adherence trajectory suggests imminent decline. Consider proactive intervention within 48 hours."
      : p.riskLevel === "medium"
      ? "Patient shows early-warning signals. A reminder cadence change may stabilize adherence."
      : "Patient is stable. Maintain current routine and monthly check-ins.",
  recommendation:
    p.riskLevel === "high"
      ? "Schedule caregiver-assisted dosing for the next 7 days."
      : p.riskLevel === "medium"
      ? "Send daily evening reminder via SMS."
      : "No intervention required.",
  predictedRate7d: Math.max(40, Math.min(98, p.adherenceRate + (p.riskLevel === "high" ? -8 : p.riskLevel === "medium" ? -2 : 2))),
}));

export const mockInterventions: MockIntervention[] = [
  { id: "i-1", patientId: "p-005", patientName: "Patricia Williams", type: "caregiver_notified", detail: "Caregiver Sarah notified about missed Warfarin", by: "Dr. Patel", at: isoHoursAgo(1) },
  { id: "i-2", patientId: "p-001", patientName: "Margaret Thompson", type: "reminder_sent", detail: "SMS reminder sent for Lisinopril", by: "System", at: isoHoursAgo(3) },
  { id: "i-3", patientId: "p-002", patientName: "Robert Chen", type: "schedule_adjusted", detail: "Evening dose moved 19:00 → 20:00", by: "Dr. Patel", at: isoHoursAgo(20) },
  { id: "i-4", patientId: "p-001", patientName: "Margaret Thompson", type: "note_added", detail: "Patient reports difficulty swallowing tablets", by: "Dr. Patel", at: isoHoursAgo(28) },
  { id: "i-5", patientId: "p-005", patientName: "Patricia Williams", type: "reminder_sent", detail: "Voice call reminder triggered", by: "System", at: isoHoursAgo(30) },
];

export const mockWeeklyAdherence = [
  { day: "Mon", rate: 84 },
  { day: "Tue", rate: 79 },
  { day: "Wed", rate: 88 },
  { day: "Thu", rate: 72 },
  { day: "Fri", rate: 81 },
  { day: "Sat", rate: 76 },
  { day: "Sun", rate: 83 },
];

export const mockMonthlyAdherence = Array.from({ length: 30 }, (_, i) => ({
  date: `D${i + 1}`,
  rate: Math.round(70 + Math.sin(i / 3) * 10 + (i % 5 === 0 ? -8 : 0)),
}));

export const mockHeatmap = Array.from({ length: 7 }, (_, r) =>
  Array.from({ length: 12 }, (_, c) => ({
    week: c,
    day: r,
    value: Math.max(0, Math.min(100, 60 + Math.round(Math.sin(r + c) * 30 + (c * r) % 11))),
  }))
).flat();

export const mockNotifications = [
  { id: "n-1", type: "emergency", title: "Patricia Williams missed Warfarin", time: isoMinutesAgo(12), unread: true },
  { id: "n-2", type: "reminder", title: "Margaret Thompson — evening Metformin in 1h", time: isoMinutesAgo(55), unread: true },
  { id: "n-3", type: "doctor", title: "Dr. Patel updated care plan for Eleanor Davis", time: isoHoursAgo(3), unread: true },
  { id: "n-4", type: "system", title: "Weekly adherence report ready", time: isoHoursAgo(10), unread: false },
  { id: "n-5", type: "reminder", title: "Robert Chen — Lisinopril at 20:00", time: isoHoursAgo(11), unread: false },
  { id: "n-6", type: "escalation", title: "Patricia Williams escalated to Dr. Patel", time: isoHoursAgo(22), unread: false },
];

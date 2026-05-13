export type Role = "patient" | "caregiver" | "doctor" | "admin";

export interface NotificationPrefs {
  push: boolean;
  sms: boolean;
  email: boolean;
  reminderLeadMinutes: number;
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  timezone?: string;
  isActive?: boolean;
  notificationPrefs?: NotificationPrefs;
  avatar?: string;
}

export interface MedicationFrequency {
  times: string[]; // "08:00"
  days: string[];  // ["all"] or weekday names
}

export interface Medication {
  id: string;
  _id?: string;
  patientId: string;
  prescribedBy?: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  startDate: string;
  endDate?: string;
  instructions?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // UI extensions
  form?: "Tablet" | "Capsule" | "Liquid" | "Injection" | "Gummy";
  type?: "Prescription" | "Supplement" | "OTC";
  tag?: string;
  daysLeft?: number;
  adherenceRate?: number;
}

export type DoseStatus = "pending" | "taken" | "missed" | "delayed" | "skipped";

export interface DoseLog {
  id?: string;
  _id?: string;
  medicationId: string | { _id: string; name: string; dosage: string };
  patientId: string;
  scheduledTime: string;
  takenAt?: string;
  status: DoseStatus;
  delayMinutes?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TodayMedicationDose {
  medication: Pick<Medication, "id" | "name" | "dosage" | "instructions">;
  scheduledDoses: { time: string; taken: boolean; logId: string | null }[];
}

export type AlertType =
  | "missed_dose"
  | "high_risk"
  | "delay"
  | "anomaly"
  | "medication_refill"
  | "low_adherence";

export type AlertStatus = "active" | "acknowledged" | "resolved";
export type AlertSeverity = "critical" | "high" | "medium" | "low";

export interface Alert {
  id?: string;
  _id?: string;
  patientId: string;
  type: AlertType;
  message: string;
  isRead: boolean;
  triggeredBy: string;
  channels: string[];
  sentTo: string[];
  createdAt: string;
  // UI helpers
  title?: string;
  status?: AlertStatus;
  severity?: AlertSeverity;
}

export interface CaregiverNote {
  id: string;
  patientId: string;
  content: string;
  type?: "observation" | "recommendation" | "concern";
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  createdAt: string;
}

export interface PatientSummary {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  relationship?: string;
  adherenceRate: number;
  lastActive?: string;
}

export interface AdherenceDailyBreakdown {
  date: string;
  total: number;
  taken: number;
  missed: number;
  delayed: number;
  rate: number;
}

export interface AdherenceSummary {
  period: string;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  delayedDoses: number;
  adherenceRate: number;
  averageDelayMinutes: number;
  dailyBreakdown: AdherenceDailyBreakdown[];
}

export interface AdherenceHistoryEntry {
  date: string;
  adherence: number;
  medications: {
    medicationId: string;
    name: string;
    scheduledDoses: number;
    takenDoses: number;
    missedDoses: number;
    delayedDoses: number;
    adherenceRate: number;
  }[];
  totalScheduled: number;
  totalTaken: number;
  totalMissed: number;
  totalDelayed: number;
  overallRate: number;
}

export interface PatientDetailSummary {
  patient: { id: string; fullName: string; email?: string };
  medications: { id: string; name: string; dosage: string; adherenceRate: number }[];
  adherenceSummary: {
    weeklyRate: number;
    monthlyRate: number;
    totalDoses: number;
    takenDoses: number;
  };
  recentAlerts: Alert[];
}

export interface AdminMetrics {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  medications: { total: number; active: number };
  adherence: { averageRate: number; weeklyTrend: string };
  system: { uptime: string; apiCalls24h: number; errorRate: number };
}

export interface PatientReport {
  patient: { id: string; fullName: string };
  period: { startDate: string; endDate: string };
  summary: {
    overallAdherence: number;
    totalMedications: number;
    totalDoses: number;
    takenDoses: number;
    missedDoses: number;
    delayedDoses: number;
  };
  medications: { name: string; adherenceRate: number; totalDoses: number; takenDoses: number }[];
  trends: { weeklyAdherence: number[]; bestDay: string; worstDay: string };
}

export interface RiskScore {
  patientId: string;
  overallRisk: number;
  riskLevel: "low" | "medium" | "high";
  factors: { factor: string; weight: number; score: number; description: string }[];
  recommendations: string[];
  calculatedAt: string;
}

export interface AIInsightsResponse {
  patientId: string;
  insights: {
    type: string;
    title: string;
    description: string;
    confidence: number;
    recommendation: string;
  }[];
  predictions: { type: string; period: string; predictedRate: number; confidence: number }[];
  generatedAt: string;
}

export interface Intervention {
  id: string;
  _id?: string;
  patientId: string;
  type: "reminder_sent" | "caregiver_notified" | "schedule_adjusted" | "note_added" | "medication_changed" | "escalation";
  detail: string;
  notes?: string;
  createdBy?: string;
  createdByName?: string;
  createdByRole?: string;
  createdAt: string;
  updatedAt?: string;
}

// ---------- Medication Catalog (Master Medications) ----------
export interface MedicationCatalog {
  id: string;
  _id?: string;
  name: string;
  genericName?: string;
  category: string;
  strength: string;
  form: "tablet" | "capsule" | "syrup" | "injection" | "other";
  manufacturer?: string;
  description?: string;
  sideEffects?: string[];
  createdAt: string;
  updatedAt?: string;
}

// ---------- Patient Medication Assignment ----------
export interface PatientMedicationAssignment {
  id: string;
  _id?: string;
  patientId: string;
  medicationId: string;
  medicationCatalog?: MedicationCatalog;
  dosage: string;
  scheduleType: "daily" | "weekly";
  times: string[];
  daysOfWeek?: string[];
  instructions?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  prescribedBy?: string;
  createdAt: string;
  updatedAt?: string;
}
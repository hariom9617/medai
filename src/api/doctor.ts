import api from "@/lib/api";
import { normalizeIds, normalizeId } from "@/lib/normalize";
import type {
  PatientSummary,
  Alert,
  DoseLog,
  Medication,
  RiskScore,
  AIInsightsResponse,
  AdherenceHistoryEntry,
  MedicationCatalog,
  PatientMedicationAssignment,
} from "@/types";
import type { MedicationCreateInput } from "@/api/medications";

export interface DoctorCreatePatientInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  conditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
  };
}

export interface DoctorCreateCaregiverInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  relationship?: string;
  address?: string;
}

export interface CaregiverInfo {
  id: string;
  fullName: string;
  email: string;
  relationship?: string;
  patientCount: number;
}

export interface MedicationCatalogCreateInput {
  name: string;
  genericName?: string;
  category: string;
  strength: string;
  form: "tablet" | "capsule" | "syrup" | "injection" | "other";
  manufacturer?: string;
  description?: string;
  sideEffects?: string[];
}

export interface MedicationCatalogUpdateInput {
  name?: string;
  genericName?: string;
  category?: string;
  strength?: string;
  form?: "tablet" | "capsule" | "syrup" | "injection" | "other";
  manufacturer?: string;
  description?: string;
  sideEffects?: string[];
}

export interface PatientMedicationAssignmentCreateInput {
  medicationId: string;
  dosage: string;
  scheduleType: "daily" | "weekly";
  times: string[];
  daysOfWeek?: string[];
  instructions?: string;
  startDate: string;
  endDate?: string;
}

export interface PatientMedicationAssignmentUpdateInput {
  dosage?: string;
  scheduleType?: "daily" | "weekly";
  times?: string[];
  daysOfWeek?: string[];
  instructions?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

/**
 * Doctor API Service
 *
 * Note: This service reuses existing endpoints where possible.
 * If the backend implements doctor-specific endpoints, update accordingly.
 *
 * Current assumptions:
 * - /caregiver/patients can be used for doctor's patient list (or backend adds /doctor/patients)
 * - /alerts supports filtering by patientId or doctorId
 * - /medications supports filtering by patientId
 * - /dose-logs supports filtering by patientId
 * - /ai/risk/:patientId and /ai/insights/:patientId work for any patient
 */

export const DoctorApi = {
  /**
   * Get list of patients assigned to the doctor
   * Currently reuses caregiver endpoint - backend should implement /doctor/patients
   */
  patients: async (): Promise<PatientSummary[]> => {
    const response = await api.get<any>("/doctor/patients");
    const d = response.data;
    // Backend now returns { patients: [...] }
    const arr = Array.isArray(d?.patients)
      ? d.patients
      : Array.isArray(d)
        ? d
        : Array.isArray(d?.data?.patients)
          ? d.data.patients
          : Array.isArray(d?.data)
            ? d.data
            : [];
    return normalizeIds(arr);
  },

  createPatient: async (input: DoctorCreatePatientInput) => {
    const response = await api.post<any>("/doctor/patients", input);
    return response.data;
  },

  createCaregiver: async (input: DoctorCreateCaregiverInput) => {
    const response = await api.post<any>("/doctor/caregivers", input);
    return response.data;
  },

  caregivers: async (): Promise<CaregiverInfo[]> => {
    const response = await api.get<any>("/doctor/caregivers");
    const d = response.data;
    const arr = Array.isArray(d)
      ? d
      : Array.isArray(d?.caregivers)
        ? d.caregivers
        : Array.isArray(d?.data)
          ? d.data
          : [];
    return normalizeIds(arr);
  },

  assignCaregiver: async (patientId: string, caregiverId: string) => {
    const response = await api.post<any>(
      `/doctor/patients/${patientId}/assign-caregiver`,
      { caregiverId },
    );
    return response.data;
  },

  createMedicationForPatient: async (
    patientId: string,
    input: MedicationCreateInput,
  ) => {
    const response = await api.post<Medication>(
      `/doctor/patients/${patientId}/medications`,
      input,
    );
    return response.data;
  },

  updateMedication: async (
    id: string,
    patch: Partial<MedicationCreateInput>,
  ) => {
    const response = await api.patch<Medication>(
      `/doctor/medications/${id}`,
      patch,
    );
    return response.data;
  },

  deleteMedication: async (id: string) => {
    const response = await api.delete<void>(`/doctor/medications/${id}`);
    return response.data;
  },

  /**
   * Get detailed patient information
   * Currently reuses caregiver endpoint - backend should implement /doctor/patients/:id
   */
  patientDetail: async (id: string) => {
    const response = await api.get<any>(`/doctor/patients/${id}`);
    return response.data;
  },

  /**
   * Get medications for a specific patient
   * Reuses medications endpoint with patientId filter
   */
  patientMedications: async (patientId: string): Promise<Medication[]> => {
    const response = await api.get<any>("/medications", {
      params: { patientId },
    });
    const d = response.data;
    const arr = Array.isArray(d)
      ? d
      : Array.isArray(d?.medications)
        ? d.medications
        : Array.isArray(d?.data)
          ? d.data
          : [];
    return normalizeIds(arr);
  },

  /**
   * Get dose logs for a specific patient
   * Reuses dose-logs endpoint with patientId filter
   */
  patientDoseLogs: async (
    patientId: string,
    params?: { from?: string; to?: string; status?: string },
  ): Promise<DoseLog[]> => {
    const response = await api.get<any>("/dose-logs", {
      params: { ...params, patientId },
    });
    const d = response.data;
    const arr = Array.isArray(d)
      ? d
      : Array.isArray(d?.doseLogs)
        ? d.doseLogs
        : Array.isArray(d?.logs)
          ? d.logs
          : Array.isArray(d?.data)
            ? d.data
            : [];
    return normalizeIds(arr);
  },

  /**
   * Get alerts for doctor's patients
   * Reuses alerts endpoint - may need doctor-specific filtering
   */
  alerts: async (params?: {
    status?: string;
    severity?: string;
  }): Promise<Alert[]> => {
    const response = await api.get<any>("/doctor/alerts", { params });
    const d = response.data;
    const arr = Array.isArray(d?.alerts) ? d.alerts : Array.isArray(d) ? d : [];
    return arr;
  },

  /**
   * Get AI risk score for a patient
   * Reuses existing AI endpoint
   */
  risk: async (patientId: string): Promise<RiskScore> => {
    const response = await api.get<RiskScore>(`/ai/risk/${patientId}`);
    return response.data;
  },

  /**
   * Get AI insights for a patient
   * Reuses existing AI endpoint
   */
  insights: async (patientId: string): Promise<AIInsightsResponse> => {
    const response = await api.get<AIInsightsResponse>(
      `/ai/insights/${patientId}`,
    );
    return response.data;
  },

  /**
   * Get adherence history for a patient
   * Reuses adherence endpoint
   */
  adherenceHistory: async (
    patientId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      groupBy?: "day" | "week" | "month";
    },
  ): Promise<AdherenceHistoryEntry[]> => {
    const response = await api.get<any>("/adherence/history", {
      params: { ...params, patientId },
    });
    const d = response.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.history)) return d.history;
    if (Array.isArray(d?.data)) return d.data;
    return [];
  },

  /**
   * Create an intervention record
   * Backend endpoint: POST /doctor/interventions
   */
  createIntervention: async (
    patientId: string,
    data: { type: string; detail: string; notes?: string },
  ) => {
    // FIXED TYPO: intatentions → interventions
    const response = await api.post(`/doctor/interventions`, {
      patientId,
      interventionType: data.type,
      reason: data.detail,
      notes: data.notes,
    });
    return response.data;
  },

  /**
   * Get intervention history for a patient
   * Backend endpoint: GET /doctor/interventions/:patientId
   */
  interventions: async (patientId: string) => {
    const response = await api.get(`/doctor/interventions/${patientId}`);
    const d = response.data;
    const arr = Array.isArray(d)
      ? d
      : Array.isArray(d?.interventions)
        ? d.interventions
        : Array.isArray(d?.data)
          ? d.data
          : [];
    return arr;
  },

  /**
   * Acknowledge an alert
   * Reuses existing alerts endpoint
   */
  acknowledgeAlert: async (id: string) => {
    const response = await api.patch(`/alerts/${id}/acknowledge`);
    return response.data;
  },

  /**
   * Resolve an alert (doctor-specific action)
   */
  resolveAlert: async (id: string, notes?: string) => {
    const response = await api.patch(`/alerts/${id}/resolve`, { notes });
    return response.data;
  },

  /**
   * Escalate an alert to caregiver
   */
  escalateAlert: async (id: string, notes?: string) => {
    const response = await api.patch(`/alerts/${id}/escalate`, { notes });
    return response.data;
  },

  // ---------- Medication Catalog (Master Medications) ----------
  /**
   * Get all medications in the catalog
   * GET /api/doctor/medications
   */
  medicationCatalog: async (): Promise<MedicationCatalog[]> => {
    const response = await api.get<any>("/doctor/medications");
    const d = response.data;
    const arr = Array.isArray(d)
      ? d
      : Array.isArray(d?.medications)
        ? d.medications
        : Array.isArray(d?.data)
          ? d.data
          : [];
    return normalizeIds(arr);
  },

  /**
   * Create a new medication in the catalog
   * POST /api/doctor/medications
   */
  createMedicationCatalog: async (
    input: MedicationCatalogCreateInput,
  ): Promise<MedicationCatalog> => {
    const response = await api.post<MedicationCatalog>(
      "/doctor/medications",
      input,
    );
    return normalizeId(response.data as any) as MedicationCatalog;
  },

  /**
   * Update a medication in the catalog
   * PATCH /api/doctor/medications/:id
   */
  updateMedicationCatalog: async (
    id: string,
    patch: MedicationCatalogUpdateInput,
  ): Promise<MedicationCatalog> => {
    const response = await api.patch<MedicationCatalog>(
      `/doctor/medications/${id}`,
      patch,
    );
    return normalizeId(response.data as any) as MedicationCatalog;
  },

  /**
   * Delete a medication from the catalog
   * DELETE /api/doctor/medications/:id
   */
  deleteMedicationCatalog: async (id: string): Promise<void> => {
    const response = await api.delete<void>(`/doctor/medications/${id}`);
    return response.data;
  },

  // ---------- Patient Medication Assignments ----------
  /**
   * Get medication assignments for a specific patient
   * GET /api/doctor/patients/:id/medications
   */
  patientMedicationAssignments: async (patientId: string) => {
    const response = await api.get(`/doctor/patients/${patientId}/medications`);
    // Return the full response.data so the query hook can unwrap it
    return response.data;
  },

  /**
   * Assign a medication to a patient
   * POST /api/doctor/patients/:id/medications
   */
  assignMedicationToPatient: async (
    patientId: string,
    input: PatientMedicationAssignmentCreateInput,
  ): Promise<PatientMedicationAssignment> => {
    const response = await api.post<PatientMedicationAssignment>(
      `/doctor/patients/${patientId}/medications`,
      input,
    );
    return normalizeId(response.data as any) as PatientMedicationAssignment;
  },

  /**
   * Update a patient medication assignment
   * PATCH /api/doctor/patient-medications/:id
   */
  updatePatientMedicationAssignment: async (
    id: string,
    patch: PatientMedicationAssignmentUpdateInput,
  ): Promise<PatientMedicationAssignment> => {
    const response = await api.patch<PatientMedicationAssignment>(
      `/doctor/patient-medications/${id}`,
      patch,
    );
    return normalizeId(response.data as any) as PatientMedicationAssignment;
  },

  /**
   * Delete a patient medication assignment
   * DELETE /api/doctor/patient-medications/:id
   */
  deletePatientMedicationAssignment: async (id: string): Promise<void> => {
    const response = await api.delete<void>(
      `/doctor/patient-medications/${id}`,
    );
    return response.data;
  },
};

import api from "@/lib/api";
import { normalizeId, normalizeIds } from "@/lib/normalize";
import type { SOSMedication, SOSDoseLog, PatientSOSMedication } from "@/types";

export interface SOSMedicationCreateInput {
  name: string;
  description?: string;
  dosage: string;
  unit: string;
  category: string;
  importance: "critical" | "important";
  sideEffects?: string;
  instructions?: string;
  maxDosesPerDay: number;
  cooldownMinutes: number;
}

export const SOSMedicationsApi = {
  list: async (): Promise<SOSMedication[]> => {
    const response = await api.get<any>("/sos-medications");
    const d = response.data;
    const arr = Array.isArray(d) ? d : d?.sosMedications ?? d?.data ?? [];
    return normalizeIds(arr);
  },

  byId: async (id: string): Promise<SOSMedication> => {
    const response = await api.get<any>(`/sos-medications/${id}`);
    const d = response.data;
    return normalizeId(d?.sosMedication ?? d) as SOSMedication;
  },

  create: async (input: SOSMedicationCreateInput): Promise<SOSMedication> => {
    const response = await api.post<any>("/sos-medications", input);
    const d = response.data;
    return normalizeId(d?.sosMedication ?? d) as SOSMedication;
  },

  update: async (id: string, patch: Partial<SOSMedicationCreateInput>): Promise<SOSMedication> => {
    const response = await api.put<any>(`/sos-medications/${id}`, patch);
    const d = response.data;
    return normalizeId(d?.sosMedication ?? d) as SOSMedication;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/sos-medications/${id}`);
  },

  assignPatients: async (id: string, patientIds: string[]): Promise<void> => {
    await api.post(`/sos-medications/${id}/assign`, { patientIds });
  },

  unassignPatient: async (id: string, patientId: string): Promise<void> => {
    await api.delete(`/sos-medications/${id}/assign/${patientId}`);
  },

  logs: async (id: string): Promise<SOSDoseLog[]> => {
    const response = await api.get<any>(`/sos-medications/${id}/logs`);
    const d = response.data;
    const arr = Array.isArray(d) ? d : d?.logs ?? d?.data ?? [];
    return normalizeIds(arr);
  },

  patientLogs: async (patientId: string): Promise<SOSDoseLog[]> => {
    const response = await api.get<any>(`/patients/${patientId}/sos-logs`);
    const d = response.data;
    const arr = Array.isArray(d) ? d : d?.logs ?? d?.data ?? [];
    return normalizeIds(arr);
  },

  myMedications: async (): Promise<PatientSOSMedication[]> => {
    const response = await api.get<any>("/sos-medications/my");
    const d = response.data;
    const arr = Array.isArray(d) ? d : d?.sosMedications ?? d?.data ?? [];
    return normalizeIds(arr);
  },

  takeDose: async (input: {
    sosMedicationId: string;
    reason: string;
    painLevel?: number;
    notes?: string;
  }): Promise<SOSDoseLog> => {
    const response = await api.post<any>("/sos-medications/take", input);
    const d = response.data;
    return normalizeId(d?.log ?? d) as SOSDoseLog;
  },
};

// src/api/caregiver.ts
import api from "@/lib/api";
import { normalizeIds, normalizeId } from "@/lib/normalize";
import type {
  CaregiverNote,
  PatientDetailSummary,
  PatientSummary,
} from "@/types";

export const CaregiverApi = {
  patients: async (): Promise<PatientSummary[]> => {
    const response = await api.get<any>("/caregiver/patients");
    const d = response.data;
    const arr = Array.isArray(d)
      ? d
      : Array.isArray(d?.patients)
        ? d.patients
        : Array.isArray(d?.data)
          ? d.data
          : [];
    return normalizeIds(arr);
  },

  patientSummary: async (id: string): Promise<PatientDetailSummary> => {
    const response = await api.get<any>(`/caregiver/patients/${id}/summary`);
    const d = response.data;
    return d?.summary ?? d;
  },

  invite: async (patientEmail: string) => {
    const response = await api.post(
      `/caregiver/invite/${encodeURIComponent(patientEmail)}`,
    );
    return response.data;
  },

  acceptInvite: async (id: string) => {
    const response = await api.patch(`/caregiver/invite/${id}/accept`);
    return response.data;
  },

  // FIXED: was hardcoded return []
  notes: async (patientId: string): Promise<CaregiverNote[]> => {
    const response = await api.get<any>(
      `/caregiver/patients/${patientId}/notes`,
    );
    const d = response.data;
    const arr = Array.isArray(d)
      ? d
      : Array.isArray(d?.notes)
        ? d.notes
        : Array.isArray(d?.data)
          ? d.data
          : [];
    return normalizeIds(arr);
  },

  addNote: async (patientId: string, content: string) => {
    const response = await api.post(`/caregiver/patients/${patientId}/notes`, {
      content,
    });
    return response.data;
  },
};

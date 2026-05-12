import api from "@/lib/api";
import { normalizeId, normalizeIds } from "@/lib/normalize";
import type { Medication, TodayMedicationDose } from "@/types";

export interface MedicationCreateInput {
  name: string;
  dosage: string;
  frequency: { times: string[]; days: string[] };
  startDate: string;
  endDate?: string;
  instructions?: string;
  patientId?: string;
  prescribedBy?: string;
}

export const MedicationsApi = {
  list: async (patientId?: string): Promise<Medication[]> => {
    const response = await api.get<any>("/medications", { params: patientId ? { patientId } : {} });
    const d = response.data;
    const arr = Array.isArray(d) ? d : Array.isArray(d?.medications) ? d.medications : Array.isArray(d?.data) ? d.data : [];
    return normalizeIds(arr);
  },
  today: async (patientId?: string): Promise<TodayMedicationDose[]> => {
    const response = await api.get<any>("/medications/today", { params: patientId ? { patientId } : {} });
    const d = response.data;
    const arr = Array.isArray(d) ? d : Array.isArray(d?.doses) ? d.doses : Array.isArray(d?.medications) ? d.medications : Array.isArray(d?.data) ? d.data : [];
    return normalizeIds(arr);
  },
  byId: async (id: string) => {
    const response = await api.get<Medication>(`/medications/${id}`);
    return normalizeId(response.data as any) as Medication;
  },
  create: async (input: MedicationCreateInput) => {
    const response = await api.post<Medication>("/medications", input);
    return normalizeId(response.data as any) as Medication;
  },
  update: async (id: string, patch: Partial<MedicationCreateInput>) => {
    const response = await api.patch<Medication>(`/medications/${id}`, patch);
    return normalizeId(response.data as any) as Medication;
  },
  remove: async (id: string) => {
    const response = await api.delete<void>(`/medications/${id}`);
    return response.data;
  },
};

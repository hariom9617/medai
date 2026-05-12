import api from "@/lib/api";
import { normalizeId, normalizeIds } from "@/lib/normalize";
import type { DoseLog, DoseStatus } from "@/types";

export const DosesApi = {
  list: async (params?: {
    from?: string;
    to?: string;
    status?: DoseStatus;
    medicationId?: string;
    patientId?: string;
  }): Promise<DoseLog[]> => {
    const response = await api.get<any>("/dose-logs", { params });
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
  take: async (id: string, notes?: string) => {
    const response = await api.post<DoseLog>(
      `/dose-logs/${id}/take`,
      notes ? { notes } : {},
    );
    return normalizeId((response.data as any)?.log ?? response.data) as DoseLog;
  },
  skip: async (id: string, notes: string) => {
    const response = await api.post<DoseLog>(`/dose-logs/${id}/skip`, {
      notes,
    });
    return normalizeId((response.data as any)?.log ?? response.data) as DoseLog;
  },
  assist: async (id: string, notes?: string) => {
    const response = await api.post<DoseLog>(`/dose-logs/${id}/assist`, {
      assistanceNotes: notes ?? "",
    });
    return normalizeId((response.data as any)?.log ?? response.data) as DoseLog;
  },
  confirm: async (id: string, notes?: string) => {
    const response = await api.post<DoseLog>(`/dose-logs/${id}/confirm`, {
      notes,
    });
    return normalizeId((response.data as any)?.log ?? response.data) as DoseLog;
  },
};

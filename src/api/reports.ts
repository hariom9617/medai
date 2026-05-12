import api, { API_BASE_URL, tokenStore } from "@/lib/api";
import type { PatientReport } from "@/types";

export const ReportsApi = {
  patient: async (id: string, params?: { startDate?: string; endDate?: string; format?: "json" | "pdf" }) => {
    const response = await api.get<PatientReport>(`/reports/patient/${id}`, { params });
    return response.data;
  },
  exportUrl: (id: string, params: { format: "pdf" | "csv" | "excel"; startDate?: string; endDate?: string }) => {
    const url = new URL(`${API_BASE_URL}/reports/export/${id}`);
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, String(v)));
    return url.toString();
  },
  exportDownload: async (id: string, params: { format: "pdf" | "csv" | "excel"; startDate?: string; endDate?: string }) => {
    const url = new URL(`${API_BASE_URL}/reports/export/${id}`);
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, String(v)));
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${tokenStore.get() ?? ""}` },
    });
    if (!res.ok) throw new Error(`Export failed (${res.status})`);
    return res.blob();
  },
};

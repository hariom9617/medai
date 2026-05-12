import api from "@/lib/api";
import type { AdherenceHistoryEntry, AdherenceSummary } from "@/types";

export const AdherenceApi = {
  summary: async (period: "week" | "month" | "quarter" | "year" = "month") => {
    const response = await api.get<AdherenceSummary>("/adherence/summary", { params: { period } });
    return response.data;
  },
  history: async (params?: { startDate?: string; endDate?: string; groupBy?: "day" | "week" | "month" }): Promise<AdherenceHistoryEntry[]> => {
    const response = await api.get<any>("/adherence/history", { params });
    const d = response.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.history)) return d.history;
    if (Array.isArray(d?.data)) return d.data;
    return [];
  },
};

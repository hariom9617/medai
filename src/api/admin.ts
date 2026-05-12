import api from "@/lib/api";
import type { AdminMetrics } from "@/types";
export const AdminApi = {
  metrics: async () => {
    const response = await api.get<AdminMetrics>("/admin/metrics");
    return response.data;
  },
};

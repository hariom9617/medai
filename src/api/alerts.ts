import api from "@/lib/api";
import type { Alert, AlertStatus, AlertType } from "@/types";

export interface AlertListParams {
  unread?: boolean;
  status?: AlertStatus;
  type?: AlertType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const AlertsApi = {
  list: async (params?: AlertListParams): Promise<Alert[]> => {
    const queryParams: Record<string, string | number> = {};
    if (params?.unread) queryParams.unread = "true";
    if (params?.status) queryParams.status = params.status;
    if (params?.type) queryParams.type = params.type;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.offset) queryParams.offset = params.offset;

    const response = await api.get<any>("/alerts", { params: queryParams });
    const d = response.data;
    const arr = Array.isArray(d?.alerts) ? d.alerts : Array.isArray(d) ? d : [];
    return arr;
  },
  acknowledge: async (id: string) => {
    const response = await api.patch(`/alerts/${id}/acknowledge`);
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(`/alerts/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (params?: { patientId?: string }): Promise<void> => {
    const response = await api.patch("/alerts/read-all", params);
    return response.data;
  },
};
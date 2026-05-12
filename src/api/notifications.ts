import api from "@/lib/api";
export const NotificationsApi = {
  test: async () => {
    const response = await api.post<{ message: string }>("/notifications/test");
    return response.data;
  },
};

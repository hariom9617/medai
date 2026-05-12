import api from "@/lib/api";
import type { AIInsightsResponse, RiskScore } from "@/types";
export const AiApi = {
  risk: async (patientId: string) => {
    const response = await api.get<RiskScore>(`/ai/risk/${patientId}`);
    return response.data;
  },
  insights: async (patientId: string) => {
    const response = await api.get<AIInsightsResponse>(`/ai/insights/${patientId}`);
    return response.data;
  },
  runPredictions: async () => {
    const response = await api.post<{ message: string }>("/ai/run-predictions");
    return response.data;
  },
};

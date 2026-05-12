import api from "@/lib/api";
import { normalizeId } from "@/lib/normalize";
import type { Role, User } from "@/types";

interface AuthResponse { user: User; accessToken: string }

function extractUser(data: any): User {
  // Server may return { user: {...} } or the user object directly
  const raw = data?.user ?? data;
  return normalizeId(raw) as User;
}

export const AuthApi = {
  async login(email: string, password: string) {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    return response.data as AuthResponse;
  },
  async register(payload: {
    email: string;
    password: string;
    fullName: string;
    role?: Role;
    phone?: string;
    timezone?: string;
  }) {
    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data as AuthResponse;
  },
  async refreshToken() {
    const response = await api.post<{ accessToken: string }>("/auth/refresh");
    return response.data;
  },
  async logout() {
    try { await api.post<void>("/auth/logout"); } catch { /* ignore */ }
  },
  getMe: async (): Promise<User> => {
    const response = await api.get<any>("/users/me");
    return extractUser(response.data);
  },
  updateMe: async (patch: Partial<User>): Promise<User> => {
    const response = await api.patch<any>("/users/me", patch);
    return extractUser(response.data);
  },
};

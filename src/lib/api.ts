import axios from 'axios';

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

const TOKEN_KEY = 'medai_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed';
    const apiError = new ApiError(msg, error.response?.status || 0, error.response?.data?.code);
    return Promise.reject(apiError);
  }
);

export default api;
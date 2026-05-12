import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { AuthApi } from '@/api/auth';
import { tokenStore } from '@/lib/api';
import { normalizeId } from '@/lib/normalize';
import type { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'SET_USER': return { user: action.payload, isAuthenticated: true, isLoading: false };
    case 'CLEAR_USER': return { user: null, isAuthenticated: false, isLoading: false };
    default: return state;
  }
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
  phone?: string;
  timezone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  updateProfile: (patch: Partial<User>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const token = tokenStore.get();
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    AuthApi.getMe()
      .then((user) => {
        dispatch({ type: 'SET_USER', payload: user });
      })
      .catch(() => {
        tokenStore.clear();
        dispatch({ type: 'CLEAR_USER' });
      });
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await AuthApi.login(email, password);
    const user = normalizeId((res as any).user ?? res) as User;
    tokenStore.set(res.accessToken);
    dispatch({ type: 'SET_USER', payload: user });
    return user;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const res = await AuthApi.register(data);
    const user = normalizeId((res as any).user ?? res) as User;
    tokenStore.set(res.accessToken);
    dispatch({ type: 'SET_USER', payload: user });
    return user;
  };

  const logout = async () => {
    await AuthApi.logout();
    tokenStore.clear();
    dispatch({ type: 'CLEAR_USER' });
    window.location.href = '/login';
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const updateProfile = async (patch: Partial<User>): Promise<User> => {
    const user = await AuthApi.updateMe(patch);
    dispatch({ type: 'SET_USER', payload: user });
    return user;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

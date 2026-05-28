import { create } from 'zustand';
import { apiGetMe, apiLogin, apiRegister, apiLogout } from './api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  fetchCurrentUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  clearError: () => set({ error: null }),
  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const resp = await apiGetMe();
      set({ user: resp.user, isAuthenticated: !!resp.user, isLoading: false });
    } catch (e: any) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const resp = await apiLogin(email, password);
      set({ user: resp.user, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.error || e?.message || 'Login failed', isLoading: false });
      throw e;
    }
  },
  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const resp = await apiRegister(name, email, password);
      set({ user: resp.user, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.error || e?.message || 'Registration failed', isLoading: false });
      throw e;
    }
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await apiLogout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false });
      throw e;
    }
  }
}));

export const useUser = () => useAuthStore(s => s.user);
export const useIsAuthenticated = () => useAuthStore(s => s.isAuthenticated);
export const useAuthLoading = () => useAuthStore(s => s.isLoading);

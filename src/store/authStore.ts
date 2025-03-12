import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    // Simulate API call
    const mockUser = {
      id: '1',
      email,
      name: 'John Doe',
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    set({ user: mockUser, isAuthenticated: true });
  },

  register: async (email: string, password: string, name: string) => {
    // Simulate API call
    const mockUser = {
      id: '1',
      email,
      name,
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    set({ user: mockUser, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
}));
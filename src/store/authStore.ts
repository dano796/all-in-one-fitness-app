import { create } from "zustand";
import { User } from "../types";

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
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: email, password }),
    });
    const result = await response.json();

    if (result.success) {
      const mockUser = { id: "1", email, name: "John Doe" };
      localStorage.setItem("user", JSON.stringify(mockUser));
      set({ user: mockUser, isAuthenticated: true });
    } else {
      throw new Error(result.error);
    }
  },

  register: async (email: string, password: string, name: string) => {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: name, correo: email, contraseña: password }),
    });
    const result = await response.json();

    if (result.success) {
      const mockUser = { id: "1", email, name };
      localStorage.setItem("user", JSON.stringify(mockUser));
      set({ user: mockUser, isAuthenticated: true });
    } else {
      throw new Error(result.error);
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },
}));
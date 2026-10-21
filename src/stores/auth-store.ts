"use client";

import { create } from "zustand";

import type { AuthUser } from "@/lib/api/types";

export type AuthStatus = "unknown" | "authenticated" | "anonymous";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "unknown",
  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "anonymous" }),
  clear: () => set({ user: null, status: "anonymous" }),
}));

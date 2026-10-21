"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { LoginInput, RegisterInput } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

import { login, logout, register } from "./api";

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user) => {
      setUser(user);
      router.push("/");
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: () => {
      router.push("/login");
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clear();
      router.push("/");
      router.refresh();
    },
  });
}

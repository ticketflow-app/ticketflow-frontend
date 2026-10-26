"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type {
  ChangePasswordInput,
  LoginInput,
  OrganizerRequestInput,
  RegisterInput,
  UpdateProfileInput,
} from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

import {
  changePassword,
  login,
  logout,
  register,
  requestOrganizer,
  updateProfile,
} from "./api";

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

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user) => {
      setUser(user);
      router.refresh();
    },
  });
}

export function useChangePassword() {
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
    onSuccess: async () => {
      await logout();
      clear();
      router.push("/login");
      router.refresh();
    },
  });
}

export function useRequestOrganizer() {
  return useMutation({
    mutationFn: (input: OrganizerRequestInput) => requestOrganizer(input),
  });
}

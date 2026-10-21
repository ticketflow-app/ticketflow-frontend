import { ApiError } from "@/lib/api/errors";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/lib/api/types";

import { API_BASE_URL } from "@/lib/api/client";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (payload.message as string) ?? "Request failed",
    );
  }

  return payload as T;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const { user } = await postJson<{ user: AuthUser }>("/api/auth/login", input);
  return user;
}

export async function register(input: RegisterInput): Promise<void> {
  await postJson<{ message: string }>("/api/auth/register", input);
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "same-origin",
  });
}

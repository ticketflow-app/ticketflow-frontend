import { cookies } from "next/headers";

import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS,
  AUTH_REFRESH_COOKIE_NAME,
} from "@/lib/config";

/** Reads the access JWT from the httpOnly cookie (server-only). */
export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/** Reads the refresh token from its httpOnly cookie (server-only). */
export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_REFRESH_COOKIE_NAME)?.value ?? null;
}

export async function setAuthSession(
  accessToken: string,
  refreshToken?: string | null,
): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });

  if (refreshToken) {
    store.set(AUTH_REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS,
    });
  }
}

/** Backwards-compatible helper for callers that only have an access token. */
export async function setAuthToken(token: string): Promise<void> {
  await setAuthSession(token);
}

export async function clearAuthSession(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
  store.delete(AUTH_REFRESH_COOKIE_NAME);
}

export async function clearAuthToken(): Promise<void> {
  await clearAuthSession();
}

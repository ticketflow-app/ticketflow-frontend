import { callGateway } from "@/lib/api/gateway";
import type { ApiResponse, AuthUser, LoginResult } from "@/lib/api/types";

import { clearAuthSession, getRefreshToken, setAuthSession } from "./session";

export interface RefreshedSession {
  accessToken: string;
  user: AuthUser;
}

/**
 * Exchanges the refresh token cookie for a new access/refresh pair and stores
 * both cookies. Must only be called from Route Handlers or Server Actions,
 * where Next.js allows mutating cookies.
 */
export async function refreshAuthSession(): Promise<RefreshedSession | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  let status: number;
  let body: unknown;
  try {
    const result = await callGateway({
      path: "/api/auth/refresh",
      method: "POST",
      body: { refreshToken },
    });
    status = result.status;
    body = result.body;
  } catch {
    return null;
  }

  const envelope = body as ApiResponse<LoginResult> | null;
  if (status !== 200 || !envelope?.success || !envelope.data?.refreshToken) {
    if (status === 401 || status === 403) {
      await clearAuthSession();
    }
    return null;
  }

  const accessToken = envelope.data.accessToken ?? envelope.data.token;
  await setAuthSession(accessToken, envelope.data.refreshToken);

  const { id, name, email, phone, role, status: userStatus, createdAt } = envelope.data;
  return {
    accessToken,
    user: { id, name, email, phone, role, status: userStatus, createdAt },
  };
}

import { callGateway } from "@/lib/api/gateway";
import type { ApiResponse, AuthUser } from "@/lib/api/types";

import { getAuthToken } from "./session";

/**
 * Resolves the authenticated user on the server using the httpOnly cookie.
 * Returns null when there is no token, the session expired or the gateway is
 * unreachable, so server components can degrade gracefully.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const { status, body } = await callGateway({ path: "/me", token });
    const envelope = body as ApiResponse<AuthUser> | null;
    if (status !== 200 || !envelope?.success) {
      return null;
    }
    return envelope.data;
  } catch {
    return null;
  }
}

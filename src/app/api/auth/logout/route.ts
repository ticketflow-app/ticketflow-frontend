import { NextResponse } from "next/server";

import { callGateway } from "@/lib/api/gateway";
import {
  clearAuthSession,
  getAuthToken,
  getRefreshToken,
} from "@/lib/auth/session";

export async function POST() {
  const [token, refreshToken] = await Promise.all([
    getAuthToken(),
    getRefreshToken(),
  ]);

  if (token) {
    try {
      await callGateway({
        path: "/api/auth/logout",
        method: "POST",
        token,
        body: refreshToken ? { refreshToken } : undefined,
      });
    } catch {
      // The local session must be cleared even when the gateway is offline.
    }
  }

  await clearAuthSession();
  return new NextResponse(null, { status: 204 });
}

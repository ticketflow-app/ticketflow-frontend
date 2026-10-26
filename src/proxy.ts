import { NextResponse, type NextRequest } from "next/server";

import type { ApiResponse, LoginResult } from "@/lib/api/types";
import {
  API_GATEWAY_URL,
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS,
  AUTH_REFRESH_COOKIE_NAME,
} from "@/lib/config";

/**
 * Refresh the access token before a page or BFF request renders on the server.
 * Route handler based refresh alone cannot help server components, because the
 * httpOnly access cookie is already expired when the layout asks for the user.
 *
 * The proxy rewrites the request cookie header so the current render sees the
 * rotated session, and also writes the new cookies to the browser response.
 */
const EXPIRY_LEEWAY_SECONDS = 30;

function getExpiration(token: string): number | null {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const expiration = getExpiration(token);
  if (expiration === null) {
    return true;
  }
  return expiration <= Math.floor(Date.now() / 1000) + EXPIRY_LEEWAY_SECONDS;
}

function setSessionCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void {
  response.cookies.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });
  response.cookies.set(AUTH_REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS,
  });
}

function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(AUTH_REFRESH_COOKIE_NAME);
}

interface RotationResult {
  data: LoginResult | null;
  unauthorized: boolean;
}

async function rotate(refreshToken: string): Promise<RotationResult> {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return { data: null, unauthorized: true };
    }

    if (!response.ok) {
      return { data: null, unauthorized: false };
    }

    const envelope = (await response.json()) as ApiResponse<LoginResult> | null;
    if (!envelope?.success || !envelope.data?.refreshToken) {
      return { data: null, unauthorized: false };
    }
    return { data: envelope.data, unauthorized: false };
  } catch {
    return { data: null, unauthorized: false };
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken || (accessToken && !isExpired(accessToken))) {
    return NextResponse.next();
  }

  const rotation = await rotate(refreshToken);
  if (!rotation.data) {
    const response = NextResponse.next();
    // A gateway outage must not destroy a session that is probably still valid.
    if (rotation.unauthorized) {
      clearSessionCookies(response);
    }
    return response;
  }

  const nextAccessToken = rotation.data.accessToken ?? rotation.data.token;
  if (!nextAccessToken) {
    const response = NextResponse.next();
    clearSessionCookies(response);
    return response;
  }

  const headers = new Headers(request.headers);
  const cookies = request.cookies
    .getAll()
    .filter(
      (cookie) =>
        cookie.name !== AUTH_COOKIE_NAME &&
        cookie.name !== AUTH_REFRESH_COOKIE_NAME,
    )
    .map((cookie) => `${cookie.name}=${cookie.value}`);
  cookies.push(`${AUTH_COOKIE_NAME}=${nextAccessToken}`);
  cookies.push(`${AUTH_REFRESH_COOKIE_NAME}=${rotation.data.refreshToken}`);
  headers.set("cookie", cookies.join("; "));

  const response = NextResponse.next({ request: { headers } });
  setSessionCookies(response, nextAccessToken, rotation.data.refreshToken);
  return response;
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};

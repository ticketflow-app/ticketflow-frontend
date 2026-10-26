import type { ApiResponse } from "./types";
import { ApiError, type ApiErrorPayload } from "./errors";

const BFF_PREFIX = "/api/gateway";

/**
 * Empty in the browser (same-origin). Tests set NEXT_PUBLIC_API_BASE_URL to an
 * absolute origin because Node's fetch does not resolve relative URLs.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/**
 * Browser-side API client. Always talks to the Next.js BFF on the same origin,
 * which forwards the request to the gateway and attaches the bearer token from
 * the httpOnly cookie. This avoids CORS and never exposes the JWT to JS.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${BFF_PREFIX}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    const body = (payload ?? {}) as ApiErrorPayload;
    throw new ApiError(
      response.status,
      body.message ?? response.statusText ?? "Request failed",
      body.error,
    );
  }

  return payload as T;
}

/** Extracts `data` from the user-service `ApiResponse` envelope. */
export function unwrapApiResponse<T>(payload: ApiResponse<T> | null | undefined): T {
  if (!payload?.success) {
    throw new ApiError(200, payload?.message ?? "Request failed");
  }
  return payload.data;
}

async function parseJson(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

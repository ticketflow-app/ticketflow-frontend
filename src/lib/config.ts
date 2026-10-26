/**
 * Server-side configuration. Do not import this module from client components:
 * API_GATEWAY_URL must never be exposed to the browser.
 */

export const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ?? "http://localhost:8080";

/** Name of the httpOnly cookie that stores the access JWT (BFF pattern). */
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "tf_token";

/** 24h, matching the current backend access-token lifetime (JWT_EXPIRATION_MS=86400000). */
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

/** Name of the httpOnly cookie that stores the refresh token. */
export const AUTH_REFRESH_COOKIE_NAME =
  process.env.AUTH_REFRESH_COOKIE_NAME ?? "tf_refresh";

/** 7 days, matching the backend refresh-token lifetime. */
export const AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

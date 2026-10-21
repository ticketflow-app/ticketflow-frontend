/**
 * Public (client-safe) flag. MSW is only started when explicitly enabled so
 * production builds never ship the service worker interception logic.
 */
export const API_MOCKING_ENABLED =
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

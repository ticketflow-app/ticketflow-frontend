import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

let startPromise: Promise<void> | null = null;

/** Starts MSW once, even if React Strict Mode mounts the provider twice. */
export function startMocking(): Promise<void> {
  if (!startPromise) {
    startPromise = worker
      .start({
        onUnhandledFrame: "bypass",
        quiet: true,
      })
      .then(() => undefined);
  }
  return startPromise;
}

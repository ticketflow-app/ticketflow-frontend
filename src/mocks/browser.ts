import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

export async function startMocking(): Promise<void> {
  await worker.start({
    onUnhandledFrame: "bypass",
    quiet: true,
  });
}

import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/** MSW server used by the Vitest test suite. */
export const server = setupServer(...handlers);

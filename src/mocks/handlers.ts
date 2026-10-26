import { http, HttpResponse } from "msw";

import { MOCK_RESERVATIONS } from "./data";

const base = "*/api/gateway";

/**
 * MSW only covers endpoints the backend does not expose yet. The catalog,
 * event detail, availability and reservation creation all go to the real
 * gateway through the BFF.
 */
export const handlers = [
  http.get(`${base}/api/reservas`, () => {
    return HttpResponse.json({ reservations: MOCK_RESERVATIONS });
  }),
];

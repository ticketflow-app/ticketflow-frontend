import { http, HttpResponse } from "msw";

import type { CreateReservationInput, EventAvailability } from "@/lib/api/types";

import {
  MOCK_AVAILABILITY,
  MOCK_EVENTS,
  MOCK_RESERVATIONS,
} from "./data";

const base = "*/api/gateway";

/**
 * Mocks only the endpoints the backend does not expose yet (catalog, event
 * detail, public availability and reservation history). Authentication and
 * reservation creation still go to the real gateway through the BFF.
 */
export const handlers = [
  http.get(`${base}/events`, ({ request }) => {
    const search = new URL(request.url).searchParams
      .get("search")
      ?.trim()
      .toLowerCase();

    const events = search
      ? MOCK_EVENTS.filter(
          (event) =>
            event.name.toLowerCase().includes(search) ||
            event.venue.toLowerCase().includes(search) ||
            event.category.toLowerCase().includes(search),
        )
      : MOCK_EVENTS;

    return HttpResponse.json({ events });
  }),

  http.get(`${base}/events/:eventId/availability`, ({ params }) => {
    const eventId = Number(params.eventId);
    const localities = MOCK_AVAILABILITY[eventId] ?? [];
    const payload: EventAvailability = { eventId, localities };
    return HttpResponse.json(payload);
  }),

  http.get(`${base}/events/:eventId`, ({ params }) => {
    const eventId = Number(params.eventId);
    const event = MOCK_EVENTS.find((item) => item.id === eventId);
    if (!event) {
      return HttpResponse.json({ message: "Event not found" }, { status: 404 });
    }
    return HttpResponse.json(event);
  }),

  http.get(`${base}/reservations`, () => {
    return HttpResponse.json({ reservations: MOCK_RESERVATIONS });
  }),

  http.post(`${base}/reservations`, async ({ request }) => {
    const input = (await request.json()) as CreateReservationInput;
    return HttpResponse.json({
      id: Date.now(),
      eventId: input.eventId,
      locality: input.locality,
      quantity: input.quantity,
      status: "CONFIRMED",
    });
  }),
];

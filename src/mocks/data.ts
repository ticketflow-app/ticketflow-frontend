import type { EventDetail, EventSummary, Reservation } from "@/lib/api/types";

export const MOCK_EVENTS: EventDetail[] = [
  {
    id: 1,
    name: "Concierto Arena 2026",
    venue: "Movistar Arena",
    startsAt: "2026-12-05T20:00:00-05:00",
    category: "Concierto",
    minPrice: 120000,
    localities: ["VIP", "Preferencial", "General"],
    description:
      "Concierto de alta demanda con aforo limitado. Las localidades se agotan rápido.",
    capacity: 300,
  },
  {
    id: 2,
    name: "Final Nacional de Fútbol",
    venue: "Estadio El Campín",
    startsAt: "2026-11-22T18:30:00-05:00",
    category: "Deportes",
    minPrice: 80000,
    localities: ["Occidental", "Oriental", "Sur"],
    description:
      "Partido decisivo del torneo. Aforo completo y alta concurrencia de compra.",
    capacity: 450,
  },
  {
    id: 3,
    name: "Festival de Teatro",
    venue: "Teatro Colón",
    startsAt: "2027-01-18T19:00:00-05:00",
    category: "Cultura",
    minPrice: 60000,
    localities: ["Platea", "Palco", "Galería"],
    description: "Obra inaugural del festival con funciones limitadas.",
    capacity: 180,
  },
];

export const MOCK_AVAILABILITY: Record<
  number,
  { locality: string; availableTickets: number }[]
> = {
  1: [
    { locality: "VIP", availableTickets: 24 },
    { locality: "Preferencial", availableTickets: 60 },
    { locality: "General", availableTickets: 12 },
  ],
  2: [
    { locality: "Occidental", availableTickets: 0 },
    { locality: "Oriental", availableTickets: 45 },
    { locality: "Sur", availableTickets: 130 },
  ],
  3: [
    { locality: "Platea", availableTickets: 18 },
    { locality: "Palco", availableTickets: 6 },
    { locality: "Galería", availableTickets: 40 },
  ],
};

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 101, eventId: 1, locality: "Preferencial", quantity: 2, status: "CONFIRMED" },
  { id: 102, eventId: 3, locality: "Platea", quantity: 1, status: "PENDING" },
];

export function findEvent(id: number): EventSummary | undefined {
  return MOCK_EVENTS.find((event) => event.id === id);
}

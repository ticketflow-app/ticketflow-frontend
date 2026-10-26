import type { Reservation } from "@/lib/api/types";

/**
 * Demo data for the only catalog-adjacent endpoint the backend does not expose
 * yet: the reservation history. Catalog and availability now hit the real
 * gateway.
 */
export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 101,
    eventId: "01930000-0000-7000-8000-000000000201",
    localityId: "01930000-0000-7000-8000-000000000301",
    quantity: 2,
    status: "CONFIRMED",
  },
  {
    id: 102,
    eventId: "01930000-0000-7000-8000-000000000202",
    localityId: "01930000-0000-7000-8000-000000000302",
    quantity: 1,
    status: "PENDING",
  },
];

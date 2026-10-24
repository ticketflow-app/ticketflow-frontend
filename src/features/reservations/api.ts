import { apiFetch } from "@/lib/api/client";
import type {
  CreateReservationInput,
  Reservation,
} from "@/lib/api/types";

export async function fetchReservations(): Promise<Reservation[]> {
  const { reservations } = await apiFetch<{ reservations: Reservation[] }>(
    "/api/reservas",
  );
  return reservations;
}

export async function createReservation(
  input: CreateReservationInput,
): Promise<Reservation> {
  return apiFetch<Reservation>("/api/reservas", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

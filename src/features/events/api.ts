import { apiFetch } from "@/lib/api/client";
import type {
  EventAvailability,
  EventDetail,
  EventSummary,
} from "@/lib/api/types";

export async function fetchEvents(search?: string): Promise<EventSummary[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const { events } = await apiFetch<{ events: EventSummary[] }>(
    `/api/catalogo/eventos${query}`,
  );
  return events;
}

export async function fetchEvent(eventId: number): Promise<EventDetail> {
  return apiFetch<EventDetail>(`/api/catalogo/eventos/${eventId}`);
}

export async function fetchAvailability(
  eventId: number,
): Promise<EventAvailability> {
  return apiFetch<EventAvailability>(`/api/inventario/eventos/${eventId}/disponibilidad`);
}

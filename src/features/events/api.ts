import { apiFetch } from "@/lib/api/client";
import type {
  EventAvailability,
  EventDetail,
  EventSummary,
} from "@/lib/api/types";

export async function fetchEvents(search?: string): Promise<EventSummary[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const { events } = await apiFetch<{ events: EventSummary[] }>(
    `/events${query}`,
  );
  return events;
}

export async function fetchEvent(eventId: number): Promise<EventDetail> {
  return apiFetch<EventDetail>(`/events/${eventId}`);
}

export async function fetchAvailability(
  eventId: number,
): Promise<EventAvailability> {
  return apiFetch<EventAvailability>(`/events/${eventId}/availability`);
}

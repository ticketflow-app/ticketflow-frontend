import { apiFetch } from "@/lib/api/client";
import type {
  Category,
  EventAvailability,
  EventDetail,
  EventSearchParams,
  EventSuggestion,
  EventSummary,
  Locality,
  PageResponse,
  Venue,
} from "@/lib/api/types";

function toSearchParams(params: EventSearchParams): string {
  const query = new URLSearchParams();

  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.ciudad) query.set("ciudad", params.ciudad);
  if (params.categoria) query.set("categoria", params.categoria);
  if (params.desde) query.set("desde", params.desde);
  if (params.hasta) query.set("hasta", params.hasta);
  if (params.precioMax != null) query.set("precioMax", String(params.precioMax));
  if (params.orden) query.set("orden", params.orden);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 12));

  return query.toString();
}

export async function fetchEvents(
  params: EventSearchParams = {},
): Promise<PageResponse<EventSummary>> {
  return apiFetch<PageResponse<EventSummary>>(
    `/api/eventos?${toSearchParams(params)}`,
  );
}

export async function fetchEvent(eventId: string): Promise<EventDetail> {
  return apiFetch<EventDetail>(`/api/eventos/${encodeURIComponent(eventId)}`);
}

export async function fetchSuggestions(
  q: string,
  limit = 8,
): Promise<EventSuggestion[]> {
  const query = new URLSearchParams({ q: q.trim(), limit: String(limit) });
  return apiFetch<EventSuggestion[]>(`/api/eventos/sugerencias?${query}`);
}

export async function fetchLocalities(eventId: string): Promise<Locality[]> {
  return apiFetch<Locality[]>(
    `/api/eventos/${encodeURIComponent(eventId)}/localidades`,
  );
}

export async function fetchVenues(city?: string): Promise<Venue[]> {
  const query = city ? `?ciudad=${encodeURIComponent(city)}` : "";
  return apiFetch<Venue[]>(`/api/recintos${query}`);
}

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/eventos/categorias");
}

export async function fetchAvailability(
  eventId: string,
): Promise<EventAvailability> {
  return apiFetch<EventAvailability>(
    `/api/inventario/eventos/${encodeURIComponent(eventId)}/disponibilidad`,
  );
}

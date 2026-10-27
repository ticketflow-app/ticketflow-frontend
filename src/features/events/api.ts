import { apiFetch } from "@/lib/api/client";
import type {
  Category,
  CreateEventInput,
  UpdateEventInput,
  VenueInput,
  UpdateVenueInput,
  UploadUrlResponse,
  EventAvailability,
  EventDetail,
  EventSearchParams,
  EventSuggestion,
  EventSummary,
  Locality,
  PageResponse,
  Venue,
  OrganizerEventSearchParams,
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
  const query = new URLSearchParams();
  if (city?.trim()) query.set("ciudad", city.trim());
  return apiFetch<Venue[]>(`/api/recintos${query.toString() ? "?" + query.toString() : ""}`);
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

export async function addLocality(eventId: string, input: { name: string; price: number; capacity: number }): Promise<Locality> {
  return apiFetch<Locality>(`/api/eventos/${encodeURIComponent(eventId)}/localidades`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createEvent(input: CreateEventInput): Promise<EventDetail> {
  return apiFetch<EventDetail>("/api/eventos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateEvent(
  eventId: string,
  input: UpdateEventInput,
): Promise<EventDetail> {
  return apiFetch<EventDetail>(
    `/api/eventos/${encodeURIComponent(eventId)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function publishEvent(eventId: string): Promise<EventDetail> {
  return apiFetch<EventDetail>(
    `/api/eventos/${encodeURIComponent(eventId)}/publicar`,
    {
      method: "POST",
    },
  );
}

export async function cancelEvent(eventId: string): Promise<EventDetail> {
  return apiFetch<EventDetail>(
    `/api/eventos/${encodeURIComponent(eventId)}/cancelar`,
    {
      method: "POST",
    },
  );
}

export async function createVenue(venue: VenueInput): Promise<Venue> {
  return apiFetch<Venue>("/api/recintos", {
    method: "POST",
    body: JSON.stringify(venue),
  });
}

export async function updateVenue(
  venueId: string,
  input: UpdateVenueInput,
): Promise<Venue> {
  return apiFetch<Venue>(
    `/api/recintos/${encodeURIComponent(venueId)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function fetchUploadUrl(
  contentType: string,
): Promise<{ imageUrl: string }> {
  return apiFetch<{ imageUrl: string }>(
    `/api/eventos/imagen-upload-url?contentType=${encodeURIComponent(contentType)}`,
  );
}

export async function fetchOrganizerEvents(
  params: OrganizerEventSearchParams = {},
): Promise<PageResponse<EventSummary>> {
  const q = new URLSearchParams();
  if (params.estado) q.set("estado", params.estado);
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  return apiFetch<PageResponse<EventSummary>>(`/api/organizador/eventos?${q.toString()}`);
}
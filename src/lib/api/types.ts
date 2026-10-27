/**
 * Types derived from docs_ia/contexto/contrato_api.md.
 * Keep them in sync with the backend contract.
 */

export type UserRole = "comprador" | "organizador" | "staff_checkin" | "admin";

export type UserStatus = "activo" | "suspendido";

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type OrganizerRequestStatus = "pendiente" | "aprobada" | "rechazada";

/** Envelope returned by user-service. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
  timestamp: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
}

export interface LoginResult extends AuthUser {
  token: string;
  accessToken?: string;
  refreshToken: string;
  tokenType?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface OrganizerRequest {
  id: string;
  userId: string;
  company: string;
  nit: string;
  status: OrganizerRequestStatus;
  createdAt: string;
  resolvedAt: string | null;
}

/** Catalog models returned by ticketflow-catalog-service (`/api/eventos`, `/api/recintos`). */
export interface EventSummary {
  id: string;
  title: string;
  status: string;
  city: string;
  venueId: string;
  venueName: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  date: string;
  minPrice: number | null;
  currency: string;
  imageUrl: string | null;
  ratingAverage: number;
  ratingCount: number;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string | null;
  capacity: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Locality {
  id: string;
  eventId: string;
  name: string;
  price: number;
  currency: string;
  capacity: number;
}

export interface EventDetail {
  id: string;
  organizerId: string;
  title: string;
  description: string | null;
  status: string;
  date: string;
  imageUrl: string | null;
  venue: Venue;
  category: Category;
  localities: Locality[];
  minPrice: number | null;
  currency: string;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventSuggestion {
  id: string;
  title: string;
  city: string;
  date: string;
}

export interface EventSearchParams {
  q?: string;
  ciudad?: string;
  categoria?: string;
  desde?: string;
  hasta?: string;
  precioMax?: number;
  orden?: string;
  page?: number;
  size?: number;
}

export interface UserListParams {
  q?: string;
  page?: number;
  size?: number;
}

export interface OrganizerEventSearchParams {
  estado?: string;
  page?: number;
  size?: number;
}

export interface CreateLocalityInput {
  name: string;
  price: number;
  capacity: number;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  categoryId: string;
  venueId: string;
  date: string;
  imageUrl?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  categoryId?: string;
  venueId?: string;
  date?: string;
  imageUrl?: string;
}

export interface VenueInput {
  name: string;
  city: string;
  address?: string;
  capacity: number;
}

export interface UpdateVenueInput {
  name?: string;
  city?: string;
  address?: string | null;
  capacity?: number;
}

export interface CancelEventInput {
  reason?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  method: string;
  contentType: string;
  imageUrl: string;
  expiresAt: string;
}

/** Inventory returns only the locality id and its live stock; names come from the catalog. */
export interface LocalityAvailability {
  localityId: string;
  availableTickets: number;
}

export interface EventAvailability {
  eventId: string;
  localities: LocalityAvailability[];
}

export interface Reservation {
  id: number;
  eventId: string;
  localityId: string;
  quantity: number;
  status: ReservationStatus;
}

export interface CreateReservationInput {
  eventId: string;
  localityId: string;
  quantity: number;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface OrganizerRequestInput {
  company: string;
  nit: string;
}

export interface UserListParams {
  q?: string;
  page?: number;
  size?: number;
}

/**
 * Types derived from docs_ia/contexto/contrato_api.md.
 * Keep them in sync with the backend contract.
 */

export type UserRole = "comprador" | "organizador" | "staff_checkin" | "admin";

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

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
  role: UserRole;
  createdAt?: string;
}

export interface LoginResult extends AuthUser {
  token: string;
}

/** Catalog models: backend does not expose them yet, MSW serves the mocks. */
export interface EventSummary {
  id: number;
  name: string;
  venue: string;
  startsAt: string;
  category: string;
  minPrice: number;
  localities: string[];
}

export interface EventDetail extends EventSummary {
  description: string;
  capacity: number;
}

export interface LocalityAvailability {
  locality: string;
  availableTickets: number;
}

export interface EventAvailability {
  eventId: number;
  localities: LocalityAvailability[];
}

export interface Reservation {
  id: number;
  eventId: number;
  locality: string;
  quantity: number;
  status: ReservationStatus;
}

export interface CreateReservationInput {
  eventId: number;
  locality: string;
  quantity: number;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

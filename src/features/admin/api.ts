import type {
  ApiResponse,
  AuthUser,
  OrganizerRequest,
  PageResponse,
  UserListParams,
  UserRole,
  UserStatus,
} from "@/lib/api/types";
import { apiFetch, unwrapApiResponse } from "@/lib/api/client";

export async function listUsers(
  params: UserListParams,
): Promise<PageResponse<AuthUser>> {
  const search = new URLSearchParams();
  if (params.q?.trim()) {
    search.set("q", params.q.trim());
  }
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 20));

  const payload = await apiFetch<ApiResponse<PageResponse<AuthUser>>>(
    `/api/usuarios?${search.toString()}`,
  );
  return unwrapApiResponse(payload);
}

export async function getUser(id: string): Promise<AuthUser> {
  const payload = await apiFetch<ApiResponse<AuthUser>>(`/api/usuarios/${id}`);
  return unwrapApiResponse(payload);
}

export async function changeUserRole(
  id: string,
  role: UserRole,
): Promise<void> {
  await apiFetch<ApiResponse<null>>(`/api/usuarios/${id}/rol`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function changeUserStatus(
  id: string,
  status: UserStatus,
): Promise<void> {
  await apiFetch<ApiResponse<null>>(`/api/usuarios/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function listOrganizerRequests(): Promise<OrganizerRequest[]> {
  const payload = await apiFetch<ApiResponse<OrganizerRequest[]>>(
    "/api/usuarios/organizador/solicitudes",
  );
  return unwrapApiResponse(payload);
}

/** Approving a request is the same operation as promoting the user. */
export async function approveOrganizerRequest(userId: string): Promise<void> {
  await changeUserRole(userId, "organizador");
}

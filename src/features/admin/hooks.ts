"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UserListParams, UserRole, UserStatus } from "@/lib/api/types";

import {
  approveOrganizerRequest,
  changeUserRole,
  changeUserStatus,
  listOrganizerRequests,
  listUsers,
} from "./api";

const usersKey = (params: UserListParams) =>
  ["admin", "users", params.q ?? "", params.page ?? 0, params.size ?? 20] as const;

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: usersKey(params),
    queryFn: () => listUsers(params),
  });
}

export function useOrganizerRequests() {
  return useQuery({
    queryKey: ["admin", "organizer-requests"],
    queryFn: listOrganizerRequests,
  });
}

function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "organizer-requests"] }),
    ]);
}

export function useChangeUserRole() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      changeUserRole(id, role),
    onSuccess: invalidate,
  });
}

export function useChangeUserStatus() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      changeUserStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useApproveOrganizerRequest() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (userId: string) => approveOrganizerRequest(userId),
    onSuccess: invalidate,
  });
}

"use client";

import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";
import type { AuthUser, UserRole, UserStatus } from "@/lib/api/types";

import {
  useApproveOrganizerRequest,
  useChangeUserRole,
  useChangeUserStatus,
  useOrganizerRequests,
  useUsers,
} from "../hooks";

const ROLE_LABELS: Record<UserRole, string> = {
  comprador: "Comprador",
  organizador: "Organizador",
  staff_checkin: "Staff check-in",
  admin: "Administrador",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  activo: "Activo",
  suspendido: "Suspendido",
};

function errorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }
  return error instanceof ApiError ? error.message : "No se pudo completar la operación";
}

interface AdminConsoleProps {
  currentUserId: string;
}

export function AdminConsole({ currentUserId }: AdminConsoleProps) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const usersQuery = useUsers({ q: query, page, size: 10 });
  const requestsQuery = useOrganizerRequests();
  const roleMutation = useChangeUserRole();
  const statusMutation = useChangeUserStatus();
  const approveMutation = useApproveOrganizerRequest();

  const actionError = useMemo(
    () =>
      errorMessage(roleMutation.error) ??
      errorMessage(statusMutation.error) ??
      errorMessage(approveMutation.error),
    [roleMutation.error, statusMutation.error, approveMutation.error],
  );

  const users = usersQuery.data?.content ?? [];
  const totalPages = usersQuery.data?.totalPages ?? 0;
  const totalElements = usersQuery.data?.totalElements ?? 0;
  const requests = requestsQuery.data ?? [];
  const pendingRequests = requests.filter((request) => request.status === "pendiente");

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setQuery(search.trim());
  }

  return (
    <div className="flex flex-col gap-6">
      {actionError ? (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Administra roles y estado de las cuentas registradas.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o correo"
              className="max-w-sm"
            />
            <Button type="submit" variant="outline">
              Buscar
            </Button>
            {query ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setQuery("");
                  setPage(0);
                }}
              >
                Limpiar
              </Button>
            ) : null}
          </form>

          {usersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando usuarios…</p>
          ) : usersQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {errorMessage(usersQuery.error) ?? "No se pudieron cargar los usuarios"}
              </AlertDescription>
            </Alert>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay usuarios para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Usuario</th>
                    <th className="py-2 pr-3 font-medium">Rol</th>
                    <th className="py-2 pr-3 font-medium">Estado</th>
                    <th className="py-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: AuthUser) => {
                    const isSelf = user.id === currentUserId;
                    return (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3 pr-3">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                          {user.phone ? (
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          ) : null}
                        </td>
                        <td className="py-3 pr-3">
                          <select
                            aria-label={`Rol de ${user.name}`}
                            value={user.role}
                            disabled={isSelf || roleMutation.isPending}
                            onChange={(event) =>
                              roleMutation.mutate({
                                id: user.id,
                                role: event.target.value as UserRole,
                              })
                            }
                            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm disabled:opacity-50"
                          >
                            {Object.entries(ROLE_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-3">
                          <Badge
                            variant={user.status === "activo" ? "secondary" : "destructive"}
                          >
                            {STATUS_LABELS[user.status]}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant={user.status === "activo" ? "destructive" : "outline"}
                            disabled={isSelf || statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate({
                                id: user.id,
                                status: user.status === "activo" ? "suspendido" : "activo",
                              })
                            }
                          >
                            {user.status === "activo" ? "Suspender" : "Activar"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              {totalElements} usuario{totalElements === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 0 || usersQuery.isFetching}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Anterior
              </Button>
              <span>
                Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages || usersQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de organizador</CardTitle>
          <CardDescription>
            {pendingRequests.length} solicitud{pendingRequests.length === 1 ? "" : "es"} pendiente
            {pendingRequests.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requestsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando solicitudes…</p>
          ) : requestsQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {errorMessage(requestsQuery.error) ??
                  "No se pudieron cargar las solicitudes"}
              </AlertDescription>
            </Alert>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay solicitudes registradas.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <div className="font-medium">{request.company}</div>
                    <div className="text-xs text-muted-foreground">
                      NIT {request.nit} · Usuario {request.userId}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={request.status === "aprobada" ? "secondary" : "outline"}
                    >
                      {request.status}
                    </Badge>
                    {request.status === "pendiente" ? (
                      <Button
                        size="sm"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(request.userId)}
                      >
                        Aprobar como organizador
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

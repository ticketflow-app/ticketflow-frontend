import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserRole, UserStatus } from "@/lib/api/types";
import {
  OrganizerRequestForm,
} from "@/features/auth/components/organizer-request-form";
import { PasswordForm } from "@/features/auth/components/password-form";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata = {
  title: "Perfil · TicketFlow",
};

/** The profile forms load and submit data in the browser. */
export const instant = false;

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

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Teléfono</span>
            <span>{user.phone || "No registrado"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Rol</span>
            <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado</span>
            <Badge variant={user.status === "activo" ? "secondary" : "destructive"}>
              {STATUS_LABELS[user.status]}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Identificador</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>Actualiza tu nombre y tu teléfono de contacto.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>
            Cambia tu contraseña. Se revocarán las sesiones activas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      {user.role === "comprador" ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quiero ser organizador</CardTitle>
            <CardDescription>
              Envía una solicitud para publicar eventos en TicketFlow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizerRequestForm />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

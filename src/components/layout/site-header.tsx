"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks";
import { useAuthStore } from "@/stores/auth-store";

export function SiteHeader() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const logout = useLogout();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TicketFlow
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Button variant="ghost" size="sm" render={<Link href="/" />}>
            Eventos
          </Button>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/reservations" />}
            >
              Mis reservas
            </Button>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {status === "authenticated" && user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
              <Button variant="ghost" size="sm" render={<Link href="/profile" />}>
                Perfil
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                Salir
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Ingresar
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                Registrarse
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

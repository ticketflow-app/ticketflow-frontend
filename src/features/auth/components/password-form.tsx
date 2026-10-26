"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/errors";

import { useChangePassword } from "../hooks";

export function PasswordForm() {
  const mutation = useChangePassword();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    mutation.mutate(
      { currentPassword, newPassword },
      {
        onError: (mutationError) =>
          setError(
            mutationError instanceof ApiError
              ? mutationError.message
              : "No se pudo cambiar la contraseña.",
          ),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div>
        <Label htmlFor="current-password">Contraseña actual</Label>
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="new-password">Nueva contraseña</Label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Al cambiarla se cerrarán las demás sesiones y deberás ingresar de nuevo.
        </p>
      </div>
      <div>
        <Button type="submit" variant="outline" disabled={mutation.isPending}>
          {mutation.isPending ? "Actualizando…" : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/errors";
import type { AuthUser } from "@/lib/api/types";

import { useUpdateProfile } from "../hooks";

export function ProfileForm({ user }: { user: AuthUser }) {
  const mutation = useUpdateProfile();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const form = new FormData(event.currentTarget);

    mutation.mutate(
      {
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
      },
      {
        onSuccess: () => setMessage("Datos actualizados correctamente."),
        onError: (mutationError) =>
          setError(
            mutationError instanceof ApiError
              ? mutationError.message
              : "No se pudieron actualizar los datos.",
          ),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <Label htmlFor="profile-name">Nombre</Label>
        <Input
          id="profile-name"
          name="name"
          defaultValue={user.name}
          required
          minLength={3}
          maxLength={120}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="profile-phone">Teléfono</Label>
        <Input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
          maxLength={30}
          className="mt-1"
          placeholder="+57 300 123 4567"
        />
      </div>
      <div>
        <Label>Correo</Label>
        <Input value={user.email} disabled className="mt-1" />
        <p className="mt-1 text-xs text-muted-foreground">
          El correo de la cuenta no se puede modificar.
        </p>
      </div>
      <div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

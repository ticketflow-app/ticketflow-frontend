"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/errors";

import { useRequestOrganizer } from "../hooks";

export function OrganizerRequestForm() {
  const mutation = useRequestOrganizer();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const company = String(form.get("company") ?? "").trim();
    const nit = String(form.get("nit") ?? "").trim();

    if (!company || !nit) {
      setError("La empresa y el NIT son obligatorios.");
      return;
    }

    mutation.mutate(
      { company, nit },
      {
        onError: (mutationError) =>
          setError(
            mutationError instanceof ApiError
              ? mutationError.message
              : "No se pudo enviar la solicitud.",
          ),
      },
    );
  }

  if (mutation.isSuccess) {
    return (
      <Alert>
        <AlertDescription>
          Solicitud enviada. Un administrador revisará tu cuenta para asignarte el rol
          de organizador.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Solicita convertir tu cuenta de comprador en organizador. Necesitamos los datos
        de la empresa responsable de los eventos.
      </p>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <Label htmlFor="organizer-company">Empresa</Label>
        <Input
          id="organizer-company"
          name="company"
          required
          maxLength={120}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="organizer-nit">NIT</Label>
        <Input
          id="organizer-nit"
          name="nit"
          required
          maxLength={40}
          className="mt-1"
        />
      </div>
      <div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Enviando…" : "Enviar solicitud"}
        </Button>
      </div>
    </form>
  );
}

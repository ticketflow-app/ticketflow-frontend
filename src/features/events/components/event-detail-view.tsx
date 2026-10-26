"use client";

import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateReservation } from "@/features/reservations/hooks";
import { isUnauthorized } from "@/lib/api/errors";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";

import { useAvailability, useEvent } from "../hooks";

export function EventDetailView({ eventId }: { eventId: string }) {
  const user = useAuthStore((state) => state.user);
  const event = useEvent(eventId);
  const availability = useAvailability(eventId);
  const reservation = useCreateReservation(eventId);

  const [localityId, setLocalityId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (event.isPending) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (event.isError || !event.data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Evento no disponible</AlertTitle>
          <AlertDescription>
            No encontramos este evento.{" "}
            <Link href="/" className="underline">
              Volver al catálogo
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const data = event.data;
  const availabilityByLocality = new Map(
    (availability.data?.localities ?? []).map((item) => [
      item.localityId,
      item.availableTickets,
    ]),
  );
  const selected = data.localities.find((item) => item.id === localityId);
  const maxQuantity = selected
    ? (availabilityByLocality.get(selected.id) ?? 0)
    : 0;
  const totalCapacity = data.localities.reduce(
    (total, locality) => total + locality.capacity,
    0,
  );

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setFeedback(null);

    if (!selected) {
      setFeedback("Selecciona una localidad.");
      return;
    }
    if (quantity < 1 || quantity > maxQuantity) {
      setFeedback("La cantidad supera la disponibilidad.");
      return;
    }

    reservation.mutate(
      { eventId: data.id, localityId: selected.id, quantity },
      {
        onSuccess: () => {
          setFeedback("Reserva creada. Revisa el estado en Mis reservas.");
          setQuantity(1);
        },
        onError: (error) => {
          if (isUnauthorized(error)) {
            setFeedback("Tu sesión expiró. Inicia sesión de nuevo.");
            return;
          }
          setFeedback(
            "No se pudo completar la reserva. Puede que ya no haya disponibilidad.",
          );
        },
      },
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <Button variant="ghost" size="sm" render={<Link href="/" />}>
        ← Volver al catálogo
      </Button>

      {data.imageUrl ? (
        <div
          role="img"
          aria-label={data.title}
          className="mt-4 h-56 w-full rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url("${data.imageUrl}")` }}
        />
      ) : null}

      <div className="mt-4 grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {data.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.venue.name} · {data.venue.city} ·{" "}
              {formatDateTime(data.date)}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{data.category.name}</Badge>
            <Badge variant="outline">
              {data.minPrice == null
                ? "Precio por confirmar"
                : `Desde ${formatCurrency(data.minPrice)}`}
            </Badge>
            <Badge variant="outline">Aforo {totalCapacity}</Badge>
          </div>
          <p className="text-sm">
            {data.description ?? "El organizador aún no agregó una descripción."}
          </p>

          <Separator />

          <div>
            <h2 className="text-sm font-medium">Localidades y disponibilidad</h2>
            {availability.isPending ? (
              <Skeleton className="mt-2 h-24 w-full" />
            ) : availability.isError ? (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>Inventario no disponible</AlertTitle>
                <AlertDescription>
                  No se pudo consultar la disponibilidad en tiempo real.
                </AlertDescription>
              </Alert>
            ) : data.localities.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Este evento todavía no tiene localidades publicadas.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-3">
                {data.localities.map((locality) => {
                  const available = availabilityByLocality.get(locality.id);
                  return (
                    <li
                      key={locality.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{locality.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(locality.price)} · Aforo{" "}
                          {locality.capacity}
                        </p>
                      </div>
                      <Badge
                        variant={
                          available != null && available > 0
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {available == null
                          ? "Sin datos"
                          : available > 0
                            ? `${available} disponibles`
                            : "Agotado"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Reservar</CardTitle>
            <CardDescription>
              La disponibilidad se descuenta de forma atómica.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="flex flex-col gap-3 text-sm">
                <p>Inicia sesión para reservar boletos.</p>
                <Button render={<Link href="/login" />}>Ingresar</Button>
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="locality">Localidad</Label>
                  <select
                    id="locality"
                    className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={localityId}
                    onChange={(changeEvent) => {
                      setLocalityId(changeEvent.target.value);
                      setQuantity(1);
                    }}
                  >
                    <option value="">Selecciona una localidad</option>
                    {data.localities.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        disabled={
                          (availabilityByLocality.get(item.id) ?? 0) === 0
                        }
                      >
                        {item.name} · {formatCurrency(item.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={Math.max(maxQuantity, 1)}
                    value={quantity}
                    onChange={(changeEvent) =>
                      setQuantity(Number(changeEvent.target.value))
                    }
                    className="mt-1"
                    disabled={!localityId || maxQuantity === 0}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    reservation.isPending ||
                    !localityId ||
                    maxQuantity === 0
                  }
                >
                  {reservation.isPending ? "Reservando…" : "Confirmar reserva"}
                </Button>
              </form>
            )}

            {feedback ? (
              <Alert className="mt-4" aria-live="polite">
                <AlertDescription>{feedback}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

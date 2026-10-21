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
import { isUnauthorized } from "@/lib/api/errors";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useCreateReservation } from "@/features/reservations/hooks";
import { useAuthStore } from "@/stores/auth-store";

import { useAvailability, useEvent } from "../hooks";

export function EventDetailView({ eventId }: { eventId: number }) {
  const user = useAuthStore((state) => state.user);
  const event = useEvent(eventId);
  const availability = useAvailability(eventId);
  const reservation = useCreateReservation(eventId);

  const [locality, setLocality] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const localities = availability.data?.localities ?? [];
  const selected = localities.find((item) => item.locality === locality);
  const maxQuantity = selected?.availableTickets ?? 0;

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setFeedback(null);

    if (!locality) {
      setFeedback("Selecciona una localidad.");
      return;
    }
    if (quantity < 1 || quantity > maxQuantity) {
      setFeedback("La cantidad supera la disponibilidad.");
      return;
    }

    reservation.mutate(
      { eventId, locality, quantity },
      {
        onSuccess: () => setFeedback("Reserva confirmada."),
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

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <Button variant="ghost" size="sm" render={<Link href="/" />}>
        ← Volver al catálogo
      </Button>

      <div className="mt-4 grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.venue} · {formatDateTime(data.startsAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{data.category}</Badge>
            <Badge variant="outline">Desde {formatCurrency(data.minPrice)}</Badge>
          </div>
          <p className="text-sm">{data.description}</p>

          <Separator />

          <div>
            <h2 className="text-sm font-medium">Disponibilidad</h2>
            {availability.isPending ? (
              <Skeleton className="mt-2 h-16 w-full" />
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {localities.map((item) => (
                  <li
                    key={item.locality}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{item.locality}</span>
                    <Badge
                      variant={
                        item.availableTickets > 0 ? "secondary" : "destructive"
                      }
                    >
                      {item.availableTickets > 0
                        ? `${item.availableTickets} disponibles`
                        : "Agotado"}
                    </Badge>
                  </li>
                ))}
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
                    value={locality}
                    onChange={(changeEvent) => {
                      setLocality(changeEvent.target.value);
                      setQuantity(1);
                    }}
                  >
                    <option value="">Selecciona una localidad</option>
                    {localities.map((item) => (
                      <option
                        key={item.locality}
                        value={item.locality}
                        disabled={item.availableTickets === 0}
                      >
                        {item.locality}
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
                    disabled={!locality}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={reservation.isPending || !locality}
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

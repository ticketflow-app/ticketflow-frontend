"use client";

import Link from "next/link";

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
import { Skeleton } from "@/components/ui/skeleton";

import { useReservations } from "../hooks";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};

export function ReservationList() {
  const { data, isPending, isError } = useReservations();

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1].map((key) => (
          <Skeleton key={key} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudieron cargar tus reservas</AlertTitle>
        <AlertDescription>
          El backend aún no expone el historial; estos datos son de
          demostración.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no tienes reservas.
          </p>
          <Button render={<Link href="/" />}>Explorar eventos</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((reservation) => (
        <Card key={reservation.id}>
          <CardHeader>
            <CardTitle>Reserva #{reservation.id}</CardTitle>
            <CardDescription>
              Evento {reservation.eventId} · Localidad{" "}
              {reservation.localityId.slice(0, 8)}…
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm">
              {reservation.quantity} boleto(s)
            </span>
            <Badge
              variant={
                reservation.status === "CONFIRMED" ? "secondary" : "outline"
              }
            >
              {STATUS_LABEL[reservation.status] ?? reservation.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

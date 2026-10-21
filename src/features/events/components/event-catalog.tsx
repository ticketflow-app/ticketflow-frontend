"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime } from "@/lib/format";

import { useEvents } from "../hooks";

export function EventCatalog() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const { data, isPending, isError } = useEvents(deferredSearch);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
        <p className="text-sm text-muted-foreground">
          Compra boletos para eventos de alta demanda. La disponibilidad se
          actualiza en tiempo real.
        </p>
      </div>

      <div className="mt-6 max-w-sm">
        <Label htmlFor="event-search">Buscar eventos</Label>
        <Input
          id="event-search"
          type="search"
          placeholder="Nombre, recinto o categoría"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mt-1"
        />
      </div>

      {isError ? (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>No se pudieron cargar los eventos</AlertTitle>
          <AlertDescription>
            Revisa que el backend esté disponible e inténtalo de nuevo.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-6" aria-live="polite">
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-44 w-full" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {data?.length ?? 0} evento(s) encontrado(s)
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.map((event) => (
                <Card key={event.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>
                      {event.venue} · {formatDateTime(event.startsAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-4">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">{event.category}</Badge>
                      {event.localities.slice(0, 3).map((locality) => (
                        <Badge key={locality} variant="outline">
                          {locality}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Desde {formatCurrency(event.minPrice)}
                      </span>
                      <Button
                        size="sm"
                        render={<Link href={`/events/${event.id}`} />}
                      >
                        Ver evento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

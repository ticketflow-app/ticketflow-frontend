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
import type { EventSearchParams } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/format";

import {
  useCategories,
  useEventSuggestions,
  useEvents,
  useVenues,
} from "../hooks";

const PAGE_SIZE = 9;

const SELECT_CLASS =
  "mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function EventCatalog() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(0);
  const deferredSearch = useDeferredValue(search);

  const venues = useVenues();
  const categories = useCategories();
  const suggestions = useEventSuggestions(deferredSearch);

  const params: EventSearchParams = {
    q: deferredSearch,
    ciudad: city || undefined,
    categoria: category || undefined,
    desde: from || undefined,
    hasta: to || undefined,
    precioMax: maxPrice ? Number(maxPrice) : undefined,
    orden: sort || undefined,
    page,
    size: PAGE_SIZE,
  };
  const { data, isPending, isError } = useEvents(params);

  const cities = Array.from(
    new Set((venues.data ?? []).map((venue) => venue.city)),
  ).sort((left, right) => left.localeCompare(right));

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(0);
  }

  function clearFilters() {
    setCity("");
    setCategory("");
    setFrom("");
    setTo("");
    setMaxPrice("");
    setSort("");
    setPage(0);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
        <p className="text-sm text-muted-foreground">
          Compra boletos para eventos de alta demanda. La disponibilidad se
          actualiza en tiempo real.
        </p>
      </div>

      <div className="mt-6 max-w-md">
        <Label htmlFor="event-search">Buscar eventos</Label>
        <Input
          id="event-search"
          type="search"
          placeholder="Nombre, recinto o categoría"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          className="mt-1"
          list="event-suggestions"
        />
        <datalist id="event-suggestions">
          {(suggestions.data ?? []).map((suggestion) => (
            <option key={suggestion.id} value={suggestion.title}>
              {suggestion.city}
            </option>
          ))}
        </datalist>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Label htmlFor="event-city">Ciudad</Label>
          <select
            id="event-city"
            className={SELECT_CLASS}
            value={city}
            onChange={(event) => updateFilter(setCity, event.target.value)}
          >
            <option value="">Todas</option>
            {cities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="event-category">Categoría</Label>
          <select
            id="event-category"
            className={SELECT_CLASS}
            value={category}
            onChange={(event) => updateFilter(setCategory, event.target.value)}
          >
            <option value="">Todas</option>
            {(categories.data ?? []).map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="event-from">Desde</Label>
          <Input
            id="event-from"
            type="date"
            className="mt-1"
            value={from}
            onChange={(event) => updateFilter(setFrom, event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="event-to">Hasta</Label>
          <Input
            id="event-to"
            type="date"
            className="mt-1"
            value={to}
            onChange={(event) => updateFilter(setTo, event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="event-max-price">Precio máximo</Label>
          <Input
            id="event-max-price"
            type="number"
            min={0}
            step={1000}
            placeholder="COP"
            className="mt-1"
            value={maxPrice}
            onChange={(event) => updateFilter(setMaxPrice, event.target.value)}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-xs">
          <Label htmlFor="event-sort">Ordenar por</Label>
          <select
            id="event-sort"
            className={SELECT_CLASS}
            value={sort}
            onChange={(event) => updateFilter(setSort, event.target.value)}
          >
            <option value="">Relevancia / fecha</option>
            <option value="fecha,asc">Fecha: más próximos</option>
            <option value="fecha,desc">Fecha: más lejanos</option>
            <option value="precio,asc">Precio: menor a mayor</option>
            <option value="precio,desc">Precio: mayor a menor</option>
          </select>
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Limpiar filtros
        </Button>
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
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <Skeleton key={key} className="h-72 w-full" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {data?.totalElements ?? 0} evento(s) encontrado(s)
            </p>

            {data && data.content.length > 0 ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.content.map((event) => (
                  <Card key={event.id} className="flex flex-col">
                    {event.imageUrl ? (
                      <div
                        role="img"
                        aria-label={event.title}
                        className="h-40 w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${event.imageUrl}")`,
                        }}
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20 text-sm text-muted-foreground">
                        {event.categoryName ?? "Evento"}
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>
                        <Link
                          href={`/events/${event.id}`}
                          className="hover:underline"
                        >
                          {event.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {event.venueName ?? "Recinto por confirmar"} ·{" "}
                        {formatDateTime(event.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between gap-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">
                          {event.categoryName ?? "Sin categoría"}
                        </Badge>
                        <Badge variant="outline">{event.city}</Badge>
                        {event.ratingCount > 0 ? (
                          <Badge variant="outline">
                            ★ {Number(event.ratingAverage).toFixed(1)}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {event.minPrice == null
                            ? "Precio por confirmar"
                            : `Desde ${formatCurrency(event.minPrice)}`}
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
            ) : (
              <Card className="mt-3">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No hay eventos que coincidan con los filtros seleccionados.
                </CardContent>
              </Card>
            )}

            {data && data.totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {data.page + 1} de {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.totalPages - 1}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Siguiente
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

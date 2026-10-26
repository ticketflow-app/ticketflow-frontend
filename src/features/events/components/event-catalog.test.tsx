import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import type { EventSummary, PageResponse } from "@/lib/api/types";
import { server } from "@/mocks/server";

import { EventCatalog } from "./event-catalog";

const EVENTS: EventSummary[] = [
  {
    id: "01930000-0000-7000-8000-000000000201",
    title: "Concierto Arena 2026",
    status: "PUBLICADO",
    date: "2026-12-05T20:00:00Z",
    city: "Medellín",
    venueId: "01930000-0000-7000-8000-000000000101",
    venueName: "Movistar Arena",
    categorySlug: "conciertos",
    categoryName: "Conciertos",
    minPrice: 120000,
    currency: "COP",
    imageUrl: null,
    ratingAverage: 0,
    ratingCount: 0,
  },
  {
    id: "01930000-0000-7000-8000-000000000202",
    title: "Final Nacional de Fútbol",
    status: "PUBLICADO",
    date: "2026-11-22T18:30:00Z",
    city: "Bogotá",
    venueId: "01930000-0000-7000-8000-000000000102",
    venueName: "Estadio El Campín",
    categorySlug: "deportes",
    categoryName: "Deportes",
    minPrice: 80000,
    currency: "COP",
    imageUrl: null,
    ratingAverage: 0,
    ratingCount: 0,
  },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function catalogHandler() {
  return http.get("*/api/gateway/api/eventos", ({ request }) => {
    const q = normalize(new URL(request.url).searchParams.get("q") ?? "");
    const content = q
      ? EVENTS.filter((event) => normalize(event.title).includes(q))
      : EVENTS;
    const payload: PageResponse<EventSummary> = {
      content,
      page: 0,
      size: 9,
      totalElements: content.length,
      totalPages: content.length > 0 ? 1 : 0,
    };
    return HttpResponse.json(payload);
  });
}

function referenceHandlers() {
  return [
    http.get("*/api/gateway/api/eventos/sugerencias", () =>
      HttpResponse.json([]),
    ),
    http.get("*/api/gateway/api/eventos/categorias", () =>
      HttpResponse.json([
        { id: "cat-1", slug: "conciertos", name: "Conciertos" },
        { id: "cat-2", slug: "deportes", name: "Deportes" },
      ]),
    ),
    http.get("*/api/gateway/api/recintos", () =>
      HttpResponse.json([
        {
          id: "venue-1",
          name: "Movistar Arena",
          city: "Medellín",
          address: null,
          capacity: 14000,
        },
        {
          id: "venue-2",
          name: "Estadio El Campín",
          city: "Bogotá",
          address: null,
          capacity: 36000,
        },
      ]),
    ),
  ];
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("EventCatalog", () => {
  it("renders the events from the catalog endpoint", async () => {
    server.use(catalogHandler(), ...referenceHandlers());
    renderWithQuery(<EventCatalog />);

    expect(
      await screen.findByText("Concierto Arena 2026"),
    ).toBeInTheDocument();
    expect(screen.getByText(/evento\(s\) encontrado\(s\)/)).toBeInTheDocument();
  });

  it("filters events by search term", async () => {
    server.use(catalogHandler(), ...referenceHandlers());
    const user = userEvent.setup({ delay: null });
    renderWithQuery(<EventCatalog />);

    await screen.findByText("Concierto Arena 2026");
    await user.type(screen.getByLabelText("Buscar eventos"), "fútbol");

    expect(
      await screen.findByText("Final Nacional de Fútbol"),
    ).toBeInTheDocument();
  }, 10_000);
});

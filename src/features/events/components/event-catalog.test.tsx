import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventCatalog } from "./event-catalog";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("EventCatalog", () => {
  it("renders the mocked events from MSW", async () => {
    renderWithQuery(<EventCatalog />);

    expect(
      await screen.findByText("Concierto Arena 2026"),
    ).toBeInTheDocument();
    expect(screen.getByText(/evento\(s\) encontrado\(s\)/)).toBeInTheDocument();
  });

  it("filters events by search term", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    renderWithQuery(<EventCatalog />);

    await screen.findByText("Concierto Arena 2026");
    await user.type(screen.getByLabelText("Buscar eventos"), "fútbol");

    expect(await screen.findByText("Final Nacional de Fútbol")).toBeInTheDocument();
  });
});

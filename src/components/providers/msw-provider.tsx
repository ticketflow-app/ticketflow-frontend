"use client";

import { useEffect, useState, type ReactNode } from "react";

import { API_MOCKING_ENABLED } from "@/lib/mocking";

/**
 * Starts MSW in the browser before rendering the app when API mocking is
 * enabled. Keeps production builds free of the interception logic.
 */
export function MswProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!API_MOCKING_ENABLED);

  useEffect(() => {
    if (!API_MOCKING_ENABLED) {
      return;
    }
    let active = true;
    void import("@/mocks/browser").then(async ({ startMocking }) => {
      await startMocking();
      if (active) {
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Iniciando datos de demostración…
      </div>
    );
  }

  return <>{children}</>;
}

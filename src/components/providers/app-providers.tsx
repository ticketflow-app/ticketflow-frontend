"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";

import type { AuthUser } from "@/lib/api/types";

import { AuthInitializer } from "./auth-initializer";

/**
 * MSW must never run on the server, and its browser entry point cannot be
 * resolved in a Node/SSR pass, so it is loaded client-only.
 */
const MswProvider = dynamic(
  () => import("./msw-provider").then((mod) => mod.MswProvider),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Cargando…
      </div>
    ),
  },
);

export function AppProviders({
  user,
  children,
}: {
  user: AuthUser | null;
  children: ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer user={user}>
        <MswProvider>{children}</MswProvider>
      </AuthInitializer>
    </QueryClientProvider>
  );
}

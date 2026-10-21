"use client";

import { useEffect, type ReactNode } from "react";

import type { AuthUser } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

/** Seeds the auth store with the user resolved on the server. */
export function AuthInitializer({
  user,
  children,
}: {
  user: AuthUser | null;
  children: ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return <>{children}</>;
}

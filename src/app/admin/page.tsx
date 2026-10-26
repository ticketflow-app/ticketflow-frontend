import { redirect } from "next/navigation";

import { AdminConsole } from "@/features/admin/components/admin-console";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata = {
  title: "Administración · TicketFlow",
};

/** The admin console loads users and requests in the browser. */
export const instant = false;

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Administración</h1>
        <p className="text-sm text-muted-foreground">
          Gestión de usuarios, roles y solicitudes para ser organizador.
        </p>
      </div>
      <div className="mt-6">
        <AdminConsole currentUserId={user.id} />
      </div>
    </div>
  );
}

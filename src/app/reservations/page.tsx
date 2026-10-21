import { ReservationList } from "@/features/reservations/components/reservation-list";

export const metadata = {
  title: "Mis reservas · TicketFlow",
};

export default function ReservationsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Mis reservas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Historial de reservas. El backend aún no expone este endpoint, así que
        se muestran datos de demostración.
      </p>
      <div className="mt-6">
        <ReservationList />
      </div>
    </div>
  );
}

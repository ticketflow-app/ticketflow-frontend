import { notFound } from "next/navigation";

import { EventDetailView } from "@/features/events/components/event-detail-view";

/** Detail and availability are loaded in the browser through TanStack Query. */
export const instant = false;

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  if (!eventId || !/^[0-9a-fA-F-]{36}$/.test(eventId)) {
    notFound();
  }

  return <EventDetailView eventId={eventId} />;
}

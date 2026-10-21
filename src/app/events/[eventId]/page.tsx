import { notFound } from "next/navigation";

import { EventDetailView } from "@/features/events/components/event-detail-view";

export default async function EventDetailPage({
  params,
}: PageProps<"/events/[eventId]">) {
  const { eventId } = await params;
  const parsed = Number(eventId);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    notFound();
  }

  return <EventDetailView eventId={parsed} />;
}

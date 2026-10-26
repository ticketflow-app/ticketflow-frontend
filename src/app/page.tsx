import { EventCatalog } from "@/features/events/components/event-catalog";

/**
 * The catalog loads its data in the browser through TanStack Query, so this
 * route is intentionally allowed to block during navigation.
 */
export const instant = false;

export default function HomePage() {
  return <EventCatalog />;
}

"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchAvailability, fetchEvent, fetchEvents } from "./api";

export const eventKeys = {
  all: ["events"] as const,
  list: (search: string) => [...eventKeys.all, "list", search] as const,
  detail: (eventId: number) => [...eventKeys.all, "detail", eventId] as const,
  availability: (eventId: number) =>
    [...eventKeys.all, "availability", eventId] as const,
};

export function useEvents(search = "") {
  return useQuery({
    queryKey: eventKeys.list(search),
    queryFn: () => fetchEvents(search),
  });
}

export function useEvent(eventId: number) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => fetchEvent(eventId),
    enabled: Number.isFinite(eventId),
  });
}

export function useAvailability(eventId: number) {
  return useQuery({
    queryKey: eventKeys.availability(eventId),
    queryFn: () => fetchAvailability(eventId),
    enabled: Number.isFinite(eventId),
  });
}

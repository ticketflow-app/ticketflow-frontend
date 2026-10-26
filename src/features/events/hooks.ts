"use client";

import { useQuery } from "@tanstack/react-query";

import type { EventSearchParams } from "@/lib/api/types";

import {
  fetchAvailability,
  fetchCategories,
  fetchEvent,
  fetchEvents,
  fetchSuggestions,
  fetchVenues,
} from "./api";

export const eventKeys = {
  all: ["events"] as const,
  list: (params: EventSearchParams) =>
    [...eventKeys.all, "list", params] as const,
  detail: (eventId: string) => [...eventKeys.all, "detail", eventId] as const,
  availability: (eventId: string) =>
    [...eventKeys.all, "availability", eventId] as const,
  suggestions: (q: string) =>
    [...eventKeys.all, "suggestions", q] as const,
  venues: (city?: string) => [...eventKeys.all, "venues", city ?? ""] as const,
  categories: () => [...eventKeys.all, "categories"] as const,
};

export function useEvents(params: EventSearchParams = {}) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => fetchEvents(params),
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => fetchEvent(eventId),
    enabled: eventId.length > 0,
  });
}

export function useAvailability(eventId: string) {
  return useQuery({
    queryKey: eventKeys.availability(eventId),
    queryFn: () => fetchAvailability(eventId),
    enabled: eventId.length > 0,
  });
}

export function useEventSuggestions(q: string) {
  return useQuery({
    queryKey: eventKeys.suggestions(q),
    queryFn: () => fetchSuggestions(q),
    enabled: q.trim().length >= 2,
  });
}

export function useVenues(city?: string) {
  return useQuery({
    queryKey: eventKeys.venues(city),
    queryFn: () => fetchVenues(city),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: eventKeys.categories(),
    queryFn: () => fetchCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

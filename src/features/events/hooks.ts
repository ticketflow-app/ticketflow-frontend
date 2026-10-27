"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { EventSearchParams, CreateEventInput, UpdateEventInput, VenueInput, UpdateVenueInput } from "@/lib/api/types";

import {
  fetchAvailability,
  fetchCategories,
  fetchEvent,
  fetchEvents,
  fetchSuggestions,
  fetchVenues,
  createEvent,
  updateEvent,
  publishEvent,
  cancelEvent,
  createVenue,
  updateVenue,
  fetchUploadUrl,
  fetchOrganizerEvents,
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
  organizerList: (params: { estado?: string; page?: number; size?: number }) =>
    [...eventKeys.all, "organizer", params] as const,
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

export function useOrganizerEvents(params: { estado?: string; page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: eventKeys.organizerList(params),
    queryFn: () => fetchOrganizerEvents(params),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, input }: { eventId: string; input: UpdateEventInput }) => updateEvent(eventId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => publishEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useCancelEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => cancelEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (venue: VenueInput) => createVenue(venue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.venues("") });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ venueId, input }: { venueId: string; input: UpdateVenueInput }) => updateVenue(venueId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.venues("") });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUploadUrl() {
  return useMutation({
    mutationFn: (contentType: string) => fetchUploadUrl(contentType),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateReservationInput } from "@/lib/api/types";
import { eventKeys } from "@/features/events/hooks";

import { createReservation, fetchReservations } from "./api";

export const reservationKeys = {
  all: ["reservations"] as const,
};

export function useReservations() {
  return useQuery({
    queryKey: reservationKeys.all,
    queryFn: fetchReservations,
  });
}

export function useCreateReservation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReservationInput) => createReservation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.availability(eventId),
      });
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

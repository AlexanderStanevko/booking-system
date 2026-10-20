import { skipToken, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryClient';
import { getReservation, getReservations } from '../api/reservations';
import type { ReservationFilters } from '../types/reservation';

export function useReservations(filters: ReservationFilters) {
  return useQuery({
    queryKey: [...queryKeys.reservationLists, filters],
    queryFn: ({ signal }) => getReservations(filters, signal),
  });
}

export function useReservation(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reservationDetail(id),
    queryFn: id ? ({ signal }) => getReservation(id, signal) : skipToken,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

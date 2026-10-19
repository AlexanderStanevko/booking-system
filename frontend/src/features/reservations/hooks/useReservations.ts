import { skipToken, useQuery } from '@tanstack/react-query';
import { queryKeys, queryPolicy } from '../../../api/queryClient';
import { getReservation, getReservations } from '../api/reservations';
import type { Reservation, ReservationFilters } from '../types/reservation';

export function useReservations(filters: ReservationFilters) {
  return useQuery({
    queryKey: [...queryKeys.reservations, filters],
    queryFn: ({ signal }) => getReservations(filters, signal),
    refetchInterval: queryPolicy.refreshInterval,
  });
}

export function useReservation(id: string | undefined, initialData?: Reservation) {
  return useQuery({
    queryKey: [...queryKeys.reservations, 'detail', id],
    queryFn: id ? ({ signal }) => getReservation(id, signal) : skipToken,
    initialData,
    staleTime: 0,
  });
}

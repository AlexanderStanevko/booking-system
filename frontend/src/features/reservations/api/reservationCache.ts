import type { InvalidateOptions, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryClient';
import type { Reservation } from '../types/reservation';

export function invalidateReservationData(client: QueryClient, options?: InvalidateOptions) {
  return Promise.all(
    [queryKeys.reservationLists, queryKeys.users, queryKeys.reports].map((queryKey) =>
      client.invalidateQueries({ queryKey }, options),
    ),
  );
}

export function updateReservationCache(client: QueryClient, reservation: Reservation) {
  client.setQueryData(queryKeys.reservationDetail(reservation.id), reservation);
  return invalidateReservationData(client);
}

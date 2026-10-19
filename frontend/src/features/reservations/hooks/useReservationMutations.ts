import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryClient';
import { changeReservationStatus, saveReservation } from '../api/reservations';

function invalidateReservationData(client: QueryClient) {
  return Promise.all(
    [queryKeys.reservations, queryKeys.users, queryKeys.reports].map((queryKey) =>
      client.invalidateQueries({ queryKey }),
    ),
  );
}

export function useSaveReservation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveReservation,
    onSuccess: () => invalidateReservationData(client),
  });
}

export function useReservationAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: changeReservationStatus,
    onSuccess: () => invalidateReservationData(client),
  });
}

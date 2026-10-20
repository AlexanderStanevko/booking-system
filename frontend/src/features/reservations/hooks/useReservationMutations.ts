import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeReservationStatus, saveReservation } from '../api/reservations';
import { updateReservationCache } from '../api/reservationCache';

export function useSaveReservation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveReservation,
    onSuccess: (reservation) => updateReservationCache(client, reservation),
  });
}

export function useReservationAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: changeReservationStatus,
    onSuccess: (reservation) => updateReservationCache(client, reservation),
  });
}

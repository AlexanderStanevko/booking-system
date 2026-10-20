import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useClock } from '@/hooks/useClock';
import { invalidateReservationData } from '../api/reservationCache';
import type { Reservation } from '../types/reservation';

export function useReservationSchedule(reservations: Reservation[]) {
  const client = useQueryClient();
  const booked = reservations.filter((reservation) => reservation.status === 'Booked');
  const { now } = useClock(
    booked.flatMap((reservation) => [
      Date.parse(reservation.startTime),
      Date.parse(reservation.endTime),
    ]),
  );
  const hasExpired = booked.some((reservation) => Date.parse(reservation.endTime) <= now);
  useEffect(() => {
    if (hasExpired) void invalidateReservationData(client, { cancelRefetch: false });
  }, [client, hasExpired, now]);
  return now;
}

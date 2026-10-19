import type { ChipProps } from '@mui/material';
import type { Reservation, ReservationStatus } from './types/reservation';

export const statusColors = {
  Booked: 'primary',
  Completed: 'success',
  Cancelled: 'default',
} satisfies Record<ReservationStatus, ChipProps['color']>;

export function reservationEligibility(reservation: Reservation, now: number) {
  if (reservation.status !== 'Booked') return { upcoming: false, ongoing: false };
  const start = Date.parse(reservation.startTime);
  const end = Date.parse(reservation.endTime);
  return { upcoming: start > now, ongoing: start <= now && now < end };
}

export function orderReservations(reservations: Reservation[]): Reservation[] {
  return [...reservations].sort((first, second) => {
    if (first.status === 'Booked' && second.status !== 'Booked') return -1;
    if (second.status === 'Booked' && first.status !== 'Booked') return 1;
    const difference = Date.parse(first.startTime) - Date.parse(second.startTime);
    return first.status === 'Booked' ? difference : -difference;
  });
}

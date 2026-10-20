import { apiRequest, queryString } from '@/api/client';
import {
  reservationSchema,
  type ReservationFilters,
  type ReservationInput,
} from '../types/reservation';

export function getReservations(filters: ReservationFilters, signal?: AbortSignal) {
  return apiRequest(`/api/reservations${queryString({ ...filters })}`, reservationSchema.array(), {
    signal,
  });
}

export function getReservation(id: string, signal?: AbortSignal) {
  return apiRequest(`/api/reservations/${id}`, reservationSchema, { signal });
}

export function saveReservation({ id, values }: { id?: string; values: ReservationInput }) {
  const path = id ? `/api/reservations/${id}` : '/api/reservations';
  return apiRequest(path, reservationSchema, { method: id ? 'PUT' : 'POST', body: values });
}

export function changeReservationStatus({
  id,
  action,
}: {
  id: string;
  action: 'cancel' | 'complete';
}) {
  return apiRequest(`/api/reservations/${id}/${action}`, reservationSchema, { method: 'POST' });
}

import { act, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { renderHook } from '../../../test/renderHook';
import { queryKeys, queryPolicy } from '../../../api/queryClient';
import { getReservation } from '../api/reservations';
import { validValues } from '../validation/reservationForm.fixtures';
import type { Reservation } from '../types/reservation';
import { useReservation } from './useReservations';

vi.mock('../api/reservations', () => ({ getReservation: vi.fn(), getReservations: vi.fn() }));
let client: QueryClient;
const reservation: Reservation = {
  ...validValues,
  id: 'meeting',
  attendeeCount: 4,
  roomName: 'Amber',
  organizerName: 'Alex Morgan',
  status: 'Booked',
  actualEndTime: null,
};
function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
beforeEach(() => {
  vi.useFakeTimers();
  client = new QueryClient({
    defaultOptions: { queries: { staleTime: queryPolicy.staleTime, gcTime: Infinity } },
  });
  vi.mocked(getReservation).mockResolvedValue(reservation);
});
afterEach(() => {
  client.clear();
  vi.clearAllMocks();
  vi.useRealTimers();
});

it('reuses fresh detail responses on reopening', async () => {
  client.setQueryData(queryKeys.reservationDetail(reservation.id), reservation);
  const view = await renderHook(() => useReservation(reservation.id), Wrapper);
  expect(view.current.data).toEqual(reservation);
  expect(getReservation).not.toHaveBeenCalled();
  await view.unmount();
  const reopened = await renderHook(() => useReservation(reservation.id), Wrapper);
  expect(reopened.current.data).toEqual(reservation);
  expect(getReservation).not.toHaveBeenCalled();
});

it('fetches stale details on opening and preserves the result during focus recovery', async () => {
  client.setQueryData(
    queryKeys.reservationDetail(reservation.id),
    { ...reservation, title: 'Old title' },
    { updatedAt: Date.now() - queryPolicy.staleTime - 1 },
  );
  const view = await renderHook(() => useReservation(reservation.id), Wrapper);
  expect(getReservation).toHaveBeenCalledTimes(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  expect(view.current.data).toEqual(reservation);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(queryPolicy.staleTime + 1);
  });
  await act(async () => document.dispatchEvent(new Event('visibilitychange', { bubbles: true })));
  expect(getReservation).toHaveBeenCalledTimes(1);
});

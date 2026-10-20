import { act, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { renderHook } from '../../../test/renderHook';
import { reservationEligibility } from '../reservationPresentation';
import type { Reservation } from '../types/reservation';
import { validValues } from '../validation/reservationForm.fixtures';
import { useReservationSchedule } from './useReservationSchedule';

const now = Date.parse('2026-01-15T08:00:00Z');
let client: QueryClient;
function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
function booking(id: string, start: number, end: number): Reservation {
  return {
    ...validValues,
    id,
    attendeeCount: 4,
    roomName: 'Amber',
    organizerName: 'Alex Morgan',
    startTime: new Date(now + start).toISOString(),
    endTime: new Date(now + end).toISOString(),
    status: 'Booked',
    actualEndTime: null,
  };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
});
afterEach(() => {
  client.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('shares one timer across rows and refreshes only when a booking ends', async () => {
  const first = booking('first', 1000, 2000);
  const second = booking('second', 2000, 4000);
  let reservations = [first, second];
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const view = await renderHook(() => useReservationSchedule(reservations), Wrapper);
  expect(vi.getTimerCount()).toBe(1);
  expect(reservationEligibility(first, view.current).upcoming).toBe(true);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1001);
  });
  expect(reservationEligibility(first, view.current).ongoing).toBe(true);
  expect(invalidate).not.toHaveBeenCalled();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(reservationEligibility(first, view.current).ongoing).toBe(false);
  expect(reservationEligibility(second, view.current).ongoing).toBe(true);
  expect(invalidate).toHaveBeenCalledTimes(3);
  reservations = [{ ...first, status: 'Completed' }, second];
  await view.rerender();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(invalidate).toHaveBeenCalledTimes(6);
  await view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('does not loop if the server still returns an expired booking', async () => {
  const reservations = [booking('expired', -2000, -1000)];
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const view = await renderHook(() => useReservationSchedule(reservations), Wrapper);
  expect(invalidate).toHaveBeenCalledTimes(3);
  await view.rerender();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60000);
  });
  expect(invalidate).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(0);
});

it('refreshes expired reservations after visibility recovery', async () => {
  const visibility = vi.spyOn(document, 'visibilityState', 'get');
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const view = await renderHook(
    () => useReservationSchedule([booking('meeting', 1000, 2000)]),
    Wrapper,
  );
  visibility.mockReturnValue('hidden');
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(invalidate).not.toHaveBeenCalled();
  visibility.mockReturnValue('visible');
  await act(async () => document.dispatchEvent(new Event('visibilitychange', { bubbles: true })));
  expect(view.current).toBe(now + 10000);
  expect(invalidate).toHaveBeenCalledTimes(3);
});

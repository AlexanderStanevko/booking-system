import { act } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { renderHook } from '../../../test/renderHook';
import { millisecondsPerMinute } from '../../../utils/dates';
import { validValues, validationContext } from '../validation/reservationForm.fixtures';
import type { Reservation } from '../types/reservation';
import { useReservationForm } from './useReservationForm';

const now = Date.parse('2026-01-15T08:00:00Z');
function context(delay: number) {
  const reservation: Reservation = {
    ...validValues,
    id: 'meeting',
    attendeeCount: 4,
    roomName: 'Amber',
    organizerName: 'Alex Morgan',
    startTime: new Date(now + delay).toISOString(),
    endTime: new Date(now + delay + millisecondsPerMinute).toISOString(),
    status: 'Booked',
    actualEndTime: null,
  };
  return { ...validationContext, reservation, now: Date.now };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('revalidates a future start exactly when it expires', async () => {
  const view = await renderHook(() => useReservationForm(context(30000)));
  expect(view.current.getFieldState('startTime').error).toBeUndefined();
  expect(vi.getTimerCount()).toBe(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30001);
  });
  expect(view.current.getFieldState('startTime').error?.message).toBe(
    'The meeting must start in the future.',
  );
  expect(vi.getTimerCount()).toBe(0);
});

it('uses one clock and only performs minute updates while a picker is open', async () => {
  let renders = 0;
  const view = await renderHook(() => {
    renders++;
    return useReservationForm(context(5 * millisecondsPerMinute));
  });
  const idleRenders = renders;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2 * millisecondsPerMinute);
  });
  expect(renders).toBe(idleRenders);
  await act(async () => view.current.onPickerOpenChange(true));
  expect(vi.getTimerCount()).toBe(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(millisecondsPerMinute + 1);
  });
  expect(view.current.now).toBe(now + 3 * millisecondsPerMinute + 1);
  await act(async () => view.current.onPickerOpenChange(false));
  const closedRenders = renders;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(millisecondsPerMinute);
  });
  expect(renders).toBe(closedRenders);
  expect(vi.getTimerCount()).toBe(1);
  await view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('revalidates on focus after the system time advances', async () => {
  const view = await renderHook(() => useReservationForm(context(millisecondsPerMinute)));
  vi.setSystemTime(now + 2 * millisecondsPerMinute);
  await act(async () => window.dispatchEvent(new Event('focus')));
  expect(view.current.getFieldState('startTime').error?.message).toBe(
    'The meeting must start in the future.',
  );
});

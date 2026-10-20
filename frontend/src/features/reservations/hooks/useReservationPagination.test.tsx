import { act, type ChangeEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { queryKeys, queryPolicy } from '../../../api/queryClient';
import { usePagination } from '../../../hooks/usePagination';
import { renderHook } from '../../../test/renderHook';
import { changeReservationStatus, getReservations, saveReservation } from '../api/reservations';
import { orderReservations } from '../reservationPresentation';
import type { Reservation } from '../types/reservation';
import { validValues } from '../validation/reservationForm.fixtures';
import { useReservationAction, useSaveReservation } from './useReservationMutations';
import { useReservations } from './useReservations';

vi.mock('../api/reservations', () => ({
  getReservations: vi.fn(),
  saveReservation: vi.fn(),
  changeReservationStatus: vi.fn(),
}));

let client: QueryClient;
let records: Reservation[];
function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
function useTable() {
  const query = useReservations({ status: 'Booked' });
  const pagination = usePagination(orderReservations(query.data ?? []));
  return { ...pagination, save: useSaveReservation(), action: useReservationAction() };
}
async function flushQueries() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}
beforeEach(() => {
  vi.useFakeTimers();
  client = new QueryClient({
    defaultOptions: { queries: { staleTime: queryPolicy.staleTime, gcTime: Infinity } },
  });
  records = Array.from({ length: 11 }, (_, index) => ({
    ...validValues,
    id: `meeting-${index}`,
    title: `Meeting ${index}`,
    attendeeCount: 4,
    roomName: 'Amber',
    organizerName: 'Alex Morgan',
    startTime: new Date(Date.UTC(2026, 0, 15, index)).toISOString(),
    endTime: new Date(Date.UTC(2026, 0, 15, index + 1)).toISOString(),
    status: 'Booked',
    actualEndTime: null,
  }));
  vi.mocked(getReservations).mockImplementation(async () =>
    records.filter((item) => item.status === 'Booked'),
  );
});
afterEach(() => {
  client.clear();
  vi.resetAllMocks();
  vi.useRealTimers();
});

it('sorts the complete result before slicing and does not request data while paging', async () => {
  const ordered = orderReservations(records);
  records.reverse();
  const view = await renderHook(useTable, Wrapper);
  await flushQueries();
  expect(view.current.items).toEqual(ordered.slice(0, 10));
  await act(async () => view.current.controls.onPageChange(null, 1));
  expect(view.current.items).toEqual(ordered.slice(10));
  await act(async () =>
    view.current.controls.onRowsPerPageChange({
      target: { value: '25' },
    } as ChangeEvent<HTMLInputElement>),
  );
  expect(view.current.items).toEqual(ordered);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(35000);
  });
  expect(getReservations).toHaveBeenCalledTimes(1);
  expect(getReservations).toHaveBeenCalledWith({ status: 'Booked' }, expect.any(AbortSignal));
});

it.each(['create', 'edit', 'cancel', 'complete'] as const)(
  'keeps pagination and detail caches correct after %s',
  async (operation) => {
    const view = await renderHook(useTable, Wrapper);
    await flushQueries();
    await act(async () => view.current.controls.onPageChange(null, 1));
    const selected = view.current.items[0];
    if (!selected) throw new Error('Expected a reservation on the last page.');
    const updated: Reservation = { ...selected, title: 'Updated meeting' };
    if (operation === 'create') updated.id = 'new-meeting';
    if (operation === 'cancel') updated.status = 'Cancelled';
    if (operation === 'complete') updated.status = 'Completed';
    records =
      operation === 'create'
        ? [...records, updated]
        : records.map((item) => (item.id === selected.id ? updated : item));
    vi.mocked(saveReservation).mockResolvedValue(updated);
    vi.mocked(changeReservationStatus).mockResolvedValue(updated);
    await act(async () => {
      if (operation === 'cancel' || operation === 'complete') {
        await view.current.action.mutateAsync({ id: selected.id, action: operation });
        return;
      }
      await view.current.save.mutateAsync({
        id: operation === 'edit' ? selected.id : undefined,
        values: updated,
      });
    });
    await flushQueries();
    const removedFromFilter = operation === 'cancel' || operation === 'complete';
    expect(view.current.controls.page).toBe(removedFromFilter ? 0 : 1);
    expect(view.current.controls.count).toBe(
      operation === 'create' ? 12 : records.filter((item) => item.status === 'Booked').length,
    );
    if (!removedFromFilter) expect(view.current.items).toContainEqual(updated);
    expect(client.getQueryData(queryKeys.reservationDetail(updated.id))).toEqual(updated);
    expect(getReservations).toHaveBeenCalledTimes(2);
  },
);

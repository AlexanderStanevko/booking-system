import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { queryKeys, queryPolicy } from '@/api/queryClient';
import { invalidateReservationData, updateReservationCache } from './reservationCache';
import { validValues } from '../validation/reservationForm.fixtures';
import type { Reservation } from '../types/reservation';

const reservation: Reservation = {
  ...validValues,
  id: 'reservation',
  attendeeCount: 4,
  roomName: 'Amber',
  organizerName: 'Alex Morgan',
  status: 'Booked',
  actualEndTime: null,
};
let client: QueryClient;
afterEach(() => client?.clear());

it('updates detail from the mutation response and refetches only active affected data', async () => {
  client = new QueryClient({ defaultOptions: { queries: { staleTime: queryPolicy.staleTime } } });
  const keys = {
    list: [...queryKeys.reservationLists, {}],
    users: queryKeys.users,
    reports: queryKeys.reports,
    rooms: [...queryKeys.rooms, {}],
    configuration: queryKeys.bookingConfiguration,
    detail: queryKeys.reservationDetail(reservation.id),
  };
  const fetchList = vi.fn().mockResolvedValue([]);
  const fetchUsers = vi.fn().mockResolvedValue([]);
  const fetchDetail = vi.fn().mockResolvedValue(reservation);
  for (const key of Object.values(keys)) client.setQueryData(key, []);
  client.setQueryData(keys.detail, reservation);
  const list = new QueryObserver(client, { queryKey: keys.list, queryFn: fetchList });
  const users = new QueryObserver(client, { queryKey: keys.users, queryFn: fetchUsers });
  const detail = new QueryObserver(client, { queryKey: keys.detail, queryFn: fetchDetail });
  const cleanups = [
    list.subscribe(() => {}),
    users.subscribe(() => {}),
    detail.subscribe(() => {}),
  ];
  const updated = { ...reservation, status: 'Cancelled' as const };
  await updateReservationCache(client, updated);
  expect(fetchList).toHaveBeenCalledTimes(1);
  expect(fetchUsers).toHaveBeenCalledTimes(1);
  expect(fetchDetail).not.toHaveBeenCalled();
  expect(client.getQueryData(keys.detail)).toEqual(updated);
  expect(client.getQueryState(keys.reports)?.isInvalidated).toBe(true);
  expect(client.getQueryState(keys.rooms)?.isInvalidated).toBe(false);
  expect(client.getQueryState(keys.configuration)?.isInvalidated).toBe(false);
  for (const cleanup of cleanups) cleanup();
});

it('coalesces concurrent boundary and focus refreshes without cancelling the active request', async () => {
  client = new QueryClient();
  const queryKey = [...queryKeys.reservationLists, {}];
  client.setQueryData(queryKey, []);
  let resolve: (value: string[]) => void = () => {};
  let signal: AbortSignal | undefined;
  const queryFn = vi.fn((context: { signal: AbortSignal }) => {
    signal = context.signal;
    return new Promise<string[]>((complete) => {
      resolve = complete;
    });
  });
  const observer = new QueryObserver(client, { queryKey, queryFn });
  const unsubscribe = observer.subscribe(() => {});
  const first = invalidateReservationData(client, { cancelRefetch: false });
  const second = invalidateReservationData(client, { cancelRefetch: false });
  expect(queryFn).toHaveBeenCalledTimes(1);
  expect(signal?.aborted).toBe(false);
  resolve([]);
  await Promise.all([first, second]);
  unsubscribe();
});

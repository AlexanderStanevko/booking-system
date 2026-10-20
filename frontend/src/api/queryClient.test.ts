import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ApiError } from './errors';
import { queryClient, queryKeys, queryPolicy } from './queryClient';

let client: QueryClient;
beforeEach(() => {
  vi.useFakeTimers();
  client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });
});
afterEach(() => {
  client.clear();
  vi.useRealTimers();
});

it('deduplicates concurrent fetches and reuses fresh cached results', async () => {
  const queryFn = vi.fn().mockResolvedValue(['result']);
  const options = { queryKey: queryKeys.users, queryFn };
  await Promise.all([client.fetchQuery(options), client.fetchQuery(options)]);
  await client.fetchQuery(options);
  expect(queryFn).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(queryPolicy.staleTime + 1);
  await client.fetchQuery(options);
  expect(queryFn).toHaveBeenCalledTimes(2);
});

it('shares requests between observers and only fetches when filter keys change', async () => {
  const queryFn = vi.fn().mockResolvedValue([]);
  const options = { queryKey: [...queryKeys.reservationLists, { status: 'Booked' }], queryFn };
  await client.fetchQuery(options);
  const first = new QueryObserver(client, options);
  const second = new QueryObserver(client, options);
  const unsubscribeFirst = first.subscribe(() => {});
  const unsubscribeSecond = second.subscribe(() => {});
  first.setOptions({ ...options, queryKey: [...queryKeys.reservationLists, { status: 'Booked' }] });
  expect(queryFn).toHaveBeenCalledTimes(1);
  first.setOptions({
    ...options,
    queryKey: [...queryKeys.reservationLists, { status: 'Cancelled' }],
  });
  await vi.advanceTimersByTimeAsync(0);
  expect(queryFn).toHaveBeenCalledTimes(2);
  first.setOptions(options);
  expect(queryFn).toHaveBeenCalledTimes(2);
  unsubscribeFirst();
  unsubscribeSecond();
});

it('cancels an unused request and starts a new one on remount', () => {
  const signals: AbortSignal[] = [];
  const observer = new QueryObserver(client, {
    queryKey: queryKeys.users,
    queryFn: ({ signal }) => {
      signals.push(signal);
      return new Promise<string[]>(() => {});
    },
  });
  const unsubscribe = observer.subscribe(() => {});
  unsubscribe();
  expect(signals[0]?.aborted).toBe(true);
  const remount = observer.subscribe(() => {});
  expect(signals).toHaveLength(2);
  expect(signals[1]?.aborted).toBe(false);
  remount();
});

it('does not retry booking errors and retries server failures only once', async () => {
  const bookingError = vi.fn().mockRejectedValue(new ApiError('CONFLICT', 'Conflict', 409));
  await expect(
    client.fetchQuery({ queryKey: ['conflict'], queryFn: bookingError }),
  ).rejects.toThrow('Conflict');
  expect(bookingError).toHaveBeenCalledTimes(1);
  const serverError = vi.fn().mockRejectedValue(new ApiError('SERVER_ERROR', 'Unavailable', 500));
  const result = client.fetchQuery({ queryKey: ['server'], queryFn: serverError, retryDelay: 0 });
  const assertion = expect(result).rejects.toThrow('Unavailable');
  await vi.advanceTimersByTimeAsync(0);
  await assertion;
  expect(serverError).toHaveBeenCalledTimes(2);
});

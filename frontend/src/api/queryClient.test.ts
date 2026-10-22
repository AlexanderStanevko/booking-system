import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ApiError } from './errors';
import { queryClient } from './queryClient';

let client: QueryClient;
beforeEach(() => {
  vi.useFakeTimers();
  client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });
});
afterEach(() => {
  client.clear();
  vi.useRealTimers();
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

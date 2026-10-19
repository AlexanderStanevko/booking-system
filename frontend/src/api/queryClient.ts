import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

export const queryPolicy = {
  staleTime: 15_000,
  refreshInterval: 30_000,
};

export const queryKeys = {
  rooms: ['rooms'],
  users: ['users'],
  reservations: ['reservations'],
  reports: ['room-usage'],
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: queryPolicy.staleTime,
      retry: (failureCount, error) =>
        failureCount < 1 &&
        error instanceof ApiError &&
        (error.status === 0 || error.status >= 500),
    },
  },
});

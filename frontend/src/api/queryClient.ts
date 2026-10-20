import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

export const queryPolicy = {
  staleTime: 60_000,
  referenceStaleTime: 5 * 60_000,
};

export const queryKeys = {
  rooms: ['rooms'],
  users: ['users'],
  reservationLists: ['reservations', 'list'],
  reservationDetail: (id?: string) => ['reservations', 'detail', id] as const,
  bookingConfiguration: ['booking-configuration'],
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

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '../../../api/client';
import { queryKeys, queryPolicy } from '../../../api/queryClient';

const bookingConfigurationSchema = z.object({
  maxDurationDays: z.number().int().positive(),
  maxAdvanceBookingDays: z.number().int().positive(),
});

export type BookingConfiguration = z.infer<typeof bookingConfigurationSchema>;

export function useBookingConfiguration(enabled = true) {
  return useQuery({
    queryKey: queryKeys.bookingConfiguration,
    enabled,
    staleTime: queryPolicy.referenceStaleTime,
    queryFn: ({ signal }) =>
      apiRequest('/api/configuration/booking', bookingConfigurationSchema, { signal }),
  });
}

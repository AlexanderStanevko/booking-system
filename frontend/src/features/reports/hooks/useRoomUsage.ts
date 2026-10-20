import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryClient';
import { getRoomUsage } from '../api/reports';
import type { RoomUsageFilters } from '../types/roomUsage';

export function useRoomUsage(filters: RoomUsageFilters) {
  return useQuery({
    queryKey: [...queryKeys.reports, filters],
    queryFn: ({ signal }) => getRoomUsage(filters, signal),
  });
}

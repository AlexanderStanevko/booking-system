import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryClient';
import { getRooms } from '../api/rooms';
import type { RoomFilters } from '../types/room';

export function useRooms(filters: RoomFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.rooms, filters],
    queryFn: ({ signal }) => getRooms(filters, signal),
  });
}

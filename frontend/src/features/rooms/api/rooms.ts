import { apiRequest, queryString } from '@/api/client';
import { roomSchema, type RoomFilters } from '../types/room';

export function getRooms(filters: RoomFilters, signal?: AbortSignal) {
  const query = queryString({ ...filters, equipment: filters.equipment?.join(',') });
  return apiRequest(`/api/rooms${query}`, roomSchema.array(), { signal });
}

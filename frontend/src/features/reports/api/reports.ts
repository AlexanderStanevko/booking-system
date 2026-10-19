import { apiRequest, queryString } from '../../../api/client';
import { roomUsageSchema, type RoomUsageFilters } from '../types/roomUsage';

export function getRoomUsage(filters: RoomUsageFilters, signal?: AbortSignal) {
  return apiRequest(
    `/api/reports/room-usage${queryString({ ...filters })}`,
    roomUsageSchema.array(),
    { signal },
  );
}

import { z } from 'zod';

export const roomUsageSchema = z.object({
  roomId: z.guid(),
  roomName: z.string(),
  totalReservations: z.number().int(),
  cancelledReservations: z.number().int(),
  completedReservations: z.number().int(),
  totalBookedHours: z.number(),
  recordedUsageHours: z.number(),
  estimatedUsedHours: z.number(),
  recordedUsageRate: z.number(),
});
export type RoomUsage = z.infer<typeof roomUsageSchema>;
export interface RoomUsageFilters {
  from?: string;
  to?: string;
}

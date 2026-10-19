import { z } from 'zod';

export const userSchema = z.object({
  id: z.guid(),
  firstName: z.string(),
  lastName: z.string(),
  activeReservationCount: z.number().int(),
});
export type User = z.infer<typeof userSchema>;

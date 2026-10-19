import { z } from 'zod';

export const reservationStatusSchema = z.enum(['Booked', 'Completed', 'Cancelled']);
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;
export const reservationSchema = z.object({
  id: z.guid(),
  roomId: z.guid(),
  roomName: z.string(),
  organizerId: z.guid(),
  organizerName: z.string(),
  title: z.string(),
  startTime: z.iso.datetime({ offset: true }),
  endTime: z.iso.datetime({ offset: true }),
  attendeeCount: z.number().int(),
  status: reservationStatusSchema,
  actualEndTime: z.iso.datetime({ offset: true }).nullable(),
});
export type Reservation = z.infer<typeof reservationSchema>;
export type ReservationInput = Pick<
  Reservation,
  'roomId' | 'organizerId' | 'title' | 'startTime' | 'endTime' | 'attendeeCount'
>;

export interface ReservationFilters {
  roomId?: string;
  organizerId?: string;
  status?: ReservationStatus;
  from?: string;
  to?: string;
}

export type ReservationAction = 'edit' | 'cancel' | 'complete';
export type ReservationDialog =
  { kind: 'create' } | { kind: ReservationAction; reservationId: string };

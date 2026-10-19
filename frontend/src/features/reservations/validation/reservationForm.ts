import { z } from 'zod';
import { isValidLocalDateTime, toLocalDateTime, toUtcTimestamp } from '../../../utils/dates';
import type { Reservation, ReservationInput } from '../types/reservation';

export const reservationFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Enter a meeting title.')
      .max(200, 'Use no more than 200 characters.'),
    roomId: z.string().min(1, 'Choose a room.'),
    organizerId: z.string().min(1, 'Choose an organizer.'),
    startTime: z.string().refine(isValidLocalDateTime, 'Enter a valid local start date and time.'),
    endTime: z.string().refine(isValidLocalDateTime, 'Enter a valid local end date and time.'),
    attendeeCount: z
      .string()
      .refine(
        (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0,
        'Enter a positive whole number of attendees.',
      )
      .transform(Number),
  })
  .superRefine((values, context) => {
    if (!isValidLocalDateTime(values.startTime) || !isValidLocalDateTime(values.endTime)) return;
    if (new Date(values.endTime) <= new Date(values.startTime)) {
      context.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'The end must be later than the start.',
      });
    }
  });

export type ReservationFormValues = z.input<typeof reservationFormSchema>;
export type ReservationFormResult = z.output<typeof reservationFormSchema>;

export function reservationFormRequest(
  values: ReservationFormResult,
  original?: Reservation,
): ReservationInput {
  return {
    ...values,
    startTime:
      original && values.startTime === toLocalDateTime(original.startTime)
        ? original.startTime
        : toUtcTimestamp(values.startTime),
    endTime:
      original && values.endTime === toLocalDateTime(original.endTime)
        ? original.endTime
        : toUtcTimestamp(values.endTime),
  };
}

export function reservationFormDefaults(reservation?: Reservation): ReservationFormValues {
  return {
    title: reservation?.title ?? '',
    roomId: reservation?.roomId ?? '',
    organizerId: reservation?.organizerId ?? '',
    startTime: reservation ? toLocalDateTime(reservation.startTime) : '',
    endTime: reservation ? toLocalDateTime(reservation.endTime) : '',
    attendeeCount: String(reservation?.attendeeCount ?? 1),
  };
}

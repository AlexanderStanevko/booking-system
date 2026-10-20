import { z } from 'zod';
import {
  isValidLocalDateTime,
  millisecondsPerDay,
  reservationTimestamp,
  toLocalDateTime,
} from '../../../utils/dates';
import type { Reservation, ReservationInput } from '../types/reservation';
import type { Room } from '../../rooms/types/room';
import type { User } from '../../users/types/user';
import type { BookingConfiguration } from '../hooks/useBookingConfiguration';

export const maximumTitleLength = 200;

interface ValidationContext {
  rooms: Room[];
  users: User[];
  configuration: BookingConfiguration;
  reservation?: Reservation;
  now?: () => number;
}

export function createReservationFormSchema({
  rooms,
  users,
  configuration,
  reservation,
  now = Date.now,
}: ValidationContext) {
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(1, 'Enter a meeting title.')
        .max(maximumTitleLength, `Use no more than ${maximumTitleLength} characters.`),
      roomId: z.string().min(1, 'Choose a room.'),
      organizerId: z.string().min(1, 'Choose an organizer.'),
      startTime: z
        .string()
        .refine(isValidLocalDateTime, 'Enter a valid local start date and time.'),
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
      const issue = (field: keyof typeof values, message: string) =>
        context.addIssue({ code: 'custom', path: [field], message });
      const room = rooms.find((room) => room.id === values.roomId);
      if (values.roomId && !room) issue('roomId', 'Choose an existing room.');
      if (room && !room.isActive) issue('roomId', 'Choose an active room.');
      if (values.organizerId && !users.some((user) => user.id === values.organizerId)) {
        issue('organizerId', 'Choose an existing organizer.');
      }
      if (room && values.attendeeCount > room.capacity) {
        issue('attendeeCount', `This room accommodates up to ${room.capacity} people.`);
      }
      if (!isValidLocalDateTime(values.startTime)) return;
      const start = Date.parse(reservationTimestamp(values.startTime, reservation?.startTime));
      const currentTime = now();
      if (start <= currentTime) issue('startTime', 'The meeting must start in the future.');
      if (start - currentTime > configuration.maxAdvanceBookingDays * millisecondsPerDay) {
        issue('startTime', `Book no more than ${configuration.maxAdvanceBookingDays} days ahead.`);
      }
      if (!isValidLocalDateTime(values.endTime)) return;
      const end = Date.parse(reservationTimestamp(values.endTime, reservation?.endTime));
      if (end <= start) issue('endTime', 'The end must be later than the start.');
      if (end - start > configuration.maxDurationDays * millisecondsPerDay) {
        issue(
          'endTime',
          `A meeting cannot last longer than ${configuration.maxDurationDays} days.`,
        );
      }
    });
}

export type ReservationFormValues = z.input<ReturnType<typeof createReservationFormSchema>>;
export type ReservationFormResult = z.output<ReturnType<typeof createReservationFormSchema>>;

export function reservationFormRequest(
  values: ReservationFormResult,
  original?: Reservation,
): ReservationInput {
  return {
    ...values,
    startTime: reservationTimestamp(values.startTime, original?.startTime),
    endTime: reservationTimestamp(values.endTime, original?.endTime),
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

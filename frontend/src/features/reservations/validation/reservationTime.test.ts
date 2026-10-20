import { describe, expect, it } from 'vitest';
import { millisecondsPerDay, toLocalDateTime } from '@/utils/dates';
import {
  createReservationFormSchema,
  reservationFormDefaults,
  reservationFormRequest,
} from './reservationForm';
import { currentTime, validValues, validationContext } from './reservationForm.fixtures';
import type { Reservation } from '../types/reservation';

const schema = createReservationFormSchema(validationContext);
const local = (timestamp: number) => toLocalDateTime(new Date(timestamp).toISOString());

describe('reservation dates and configurable limits', () => {
  it.each(['2026-01-15T09:00', '2026-01-15T10:00', 'invalid', '10000-01-01T10:00'])(
    'rejects past, present or invalid start: %s',
    (startTime) => {
      expect(schema.safeParse({ ...validValues, startTime }).success).toBe(false);
    },
  );

  it.each(['2026-01-15T10:00', '2026-01-15T11:00', 'invalid'])(
    'rejects invalid end: %s',
    (endTime) => {
      expect(schema.safeParse({ ...validValues, endTime }).success).toBe(false);
    },
  );

  it.each([6, 7, 8])('checks duration of %s days', (days) => {
    const start = currentTime + millisecondsPerDay;
    const result = schema.safeParse({
      ...validValues,
      startTime: local(start),
      endTime: local(start + days * millisecondsPerDay),
    });
    expect(result.success).toBe(days <= validationContext.configuration.maxDurationDays);
  });

  it.each([89, 90, 91])('checks booking %s days ahead', (days) => {
    const start = currentTime + days * millisecondsPerDay;
    expect(
      schema.safeParse({ ...validValues, startTime: local(start), endTime: local(start + 60_000) })
        .success,
    ).toBe(days <= validationContext.configuration.maxAdvanceBookingDays);
  });

  it('uses new configuration rather than independently maintained limits', () => {
    const configured = createReservationFormSchema({
      ...validationContext,
      configuration: { maxDurationDays: 1, maxAdvanceBookingDays: 2 },
    });
    expect(configured.safeParse({ ...validValues, endTime: '2026-01-17T12:00' }).success).toBe(
      false,
    );
    expect(
      configured.safeParse({
        ...validValues,
        startTime: '2026-01-18T11:00',
        endTime: '2026-01-18T12:00',
      }).success,
    ).toBe(false);
  });

  it('reads the current time on each validation', () => {
    let now = currentTime;
    const dynamic = createReservationFormSchema({ ...validationContext, now: () => now });
    expect(dynamic.safeParse(validValues).success).toBe(true);
    now += millisecondsPerDay;
    expect(dynamic.safeParse(validValues).success).toBe(false);
  });

  it('preserves unchanged API timestamps through editing and validation', () => {
    const original: Reservation = {
      ...validValues,
      attendeeCount: 4,
      id: 'reservation',
      roomName: 'Amber',
      organizerName: 'Alex Morgan',
      startTime: '2026-10-25T01:30:12.1234567Z',
      endTime: '2026-10-25T02:30:45.7654321Z',
      status: 'Booked',
      actualEndTime: null,
    };
    const editSchema = createReservationFormSchema({
      ...validationContext,
      reservation: original,
      now: () => Date.parse('2026-10-25T01:00:00Z'),
    });
    const request = reservationFormRequest(
      editSchema.parse(reservationFormDefaults(original)),
      original,
    );
    expect(request.startTime).toBe(original.startTime);
    expect(request.endTime).toBe(original.endTime);
  });
});

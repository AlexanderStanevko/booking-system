import { expect, it } from 'vitest';
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

it('requires a valid future start and an end strictly after it', () => {
  for (const startTime of [
    '2026-01-15T09:00',
    '2026-01-15T10:00',
    'invalid',
    '10000-01-01T10:00',
  ]) {
    expect(schema.safeParse({ ...validValues, startTime }).success, startTime).toBe(false);
  }
  for (const endTime of ['2026-01-15T10:00', '2026-01-15T11:00', 'invalid']) {
    expect(schema.safeParse({ ...validValues, endTime }).success, endTime).toBe(false);
  }
});

it('allows the exact duration limit and rejects longer meetings', () => {
  const start = currentTime + millisecondsPerDay;
  for (const days of [7, 8]) {
    const result = schema.safeParse({
      ...validValues,
      startTime: local(start),
      endTime: local(start + days * millisecondsPerDay),
    });
    expect(result.success, `${days} days`).toBe(
      days <= validationContext.configuration.maxDurationDays,
    );
  }
});

it('allows the exact advance-booking horizon and rejects later starts', () => {
  for (const days of [90, 91]) {
    const start = currentTime + days * millisecondsPerDay;
    expect(
      schema.safeParse({ ...validValues, startTime: local(start), endTime: local(start + 60_000) })
        .success,
      `${days} days`,
    ).toBe(days <= validationContext.configuration.maxAdvanceBookingDays);
  }
});

it('uses server-supplied configuration for duration and horizon limits', () => {
  const configured = createReservationFormSchema({
    ...validationContext,
    configuration: { maxDurationDays: 1, maxAdvanceBookingDays: 2 },
  });
  expect(configured.safeParse({ ...validValues, endTime: '2026-01-17T12:00' }).success).toBe(false);
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

it('preserves server precision and the repeated-time occurrence through editing', () => {
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
  const values = editSchema.parse(reservationFormDefaults(original));
  const request = reservationFormRequest(values, original);
  expect(request.startTime).toBe(original.startTime);
  expect(request.endTime).toBe(original.endTime);
  const changed = reservationFormRequest(
    { ...values, startTime: '2026-10-25T05:30', endTime: '2026-10-25T06:30' },
    original,
  );
  expect(changed.startTime).toBe('2026-10-25T03:30:00.000Z');
  expect(changed.endTime).toBe('2026-10-25T04:30:00.000Z');
});

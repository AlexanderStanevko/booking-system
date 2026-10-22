import { expect, it } from 'vitest';
import { createReservationFormSchema, maximumTitleLength } from './reservationForm';
import { room, validValues, validationContext } from './reservationForm.fixtures';

const schema = createReservationFormSchema(validationContext);

it('validates attendee counts against the currently selected room', () => {
  expect(schema.parse(validValues).attendeeCount).toBe(room.capacity);
  for (const attendeeCount of ['0', '1.5', '5', 'invalid']) {
    const result = schema.safeParse({ ...validValues, attendeeCount });
    expect(result.success, attendeeCount).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['attendeeCount']);
  }
  const smallerRoom = { ...room, id: 'other-room', capacity: 2 };
  const changedRoom = createReservationFormSchema({
    ...validationContext,
    rooms: [room, smallerRoom],
  });
  expect(changedRoom.safeParse({ ...validValues, roomId: smallerRoom.id }).success).toBe(false);
});

it('requires a nonblank title within the length limit', () => {
  expect(schema.safeParse({ ...validValues, title: 'x'.repeat(maximumTitleLength) }).success).toBe(
    true,
  );
  for (const title of ['   ', 'x'.repeat(maximumTitleLength + 1)]) {
    expect(schema.safeParse({ ...validValues, title }).success).toBe(false);
  }
});

it('requires existing room and organizer IDs', () => {
  for (const field of ['roomId', 'organizerId'] as const) {
    for (const value of ['', 'unknown']) {
      const result = schema.safeParse({ ...validValues, [field]: value });
      expect(result.success, `${field}: ${value}`).toBe(false);
      if (!result.success) expect(result.error.issues[0]?.path).toEqual([field]);
    }
  }
});

it('rejects inactive rooms', () => {
  const inactiveSchema = createReservationFormSchema({
    ...validationContext,
    rooms: [{ ...room, isActive: false }],
  });
  const result = inactiveSchema.safeParse(validValues);
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error.issues[0]?.path).toEqual(['roomId']);
});

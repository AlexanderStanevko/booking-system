import { describe, expect, it } from 'vitest';
import { createReservationFormSchema, maximumTitleLength } from './reservationForm';
import { room, validValues, validationContext } from './reservationForm.fixtures';

const schema = createReservationFormSchema(validationContext);

describe('reservation field validation', () => {
  it('accepts capacity exactly and transforms the attendee count', () => {
    expect(schema.parse(validValues).attendeeCount).toBe(room.capacity);
  });

  it.each(['', '   ', 'x'.repeat(maximumTitleLength + 1)])('rejects invalid titles', (title) => {
    expect(schema.safeParse({ ...validValues, title }).success).toBe(false);
  });

  it.each(['', '0', '-1', '1.5', '5', 'invalid'])(
    'rejects invalid attendee count: %s',
    (attendeeCount) => {
      const result = schema.safeParse({ ...validValues, attendeeCount });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0]?.path).toEqual(['attendeeCount']);
    },
  );

  it.each(['roomId', 'organizerId'] as const)('requires an existing %s', (field) => {
    expect(schema.safeParse({ ...validValues, [field]: '' }).success).toBe(false);
    expect(schema.safeParse({ ...validValues, [field]: 'unknown' }).success).toBe(false);
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

  it('revalidates capacity when the selected room changes', () => {
    const smallerRoom = { ...room, id: 'other-room', capacity: 2 };
    const updatedSchema = createReservationFormSchema({
      ...validationContext,
      rooms: [room, smallerRoom],
    });
    expect(updatedSchema.safeParse(validValues).success).toBe(true);
    expect(updatedSchema.safeParse({ ...validValues, roomId: smallerRoom.id }).success).toBe(false);
  });
});

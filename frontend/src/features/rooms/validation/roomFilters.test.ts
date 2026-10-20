import { expect, it } from 'vitest';
import { roomFilterSchema } from './roomFilters';

it('clears optional filters and accepts basement floors', () => {
  expect(roomFilterSchema.parse({ minCapacity: '', floor: '' })).toEqual({
    minCapacity: undefined,
    floor: undefined,
  });
  expect(roomFilterSchema.parse({ minCapacity: '4', floor: '-1' })).toEqual({
    minCapacity: 4,
    floor: -1,
  });
});

it.each(['0', '-1', '1.5', 'invalid', '1e2', '2147483648'])(
  'rejects invalid capacity: %s',
  (minCapacity) => {
    expect(roomFilterSchema.safeParse({ minCapacity, floor: '' }).success).toBe(false);
  },
);

it.each(['1.5', 'invalid', '2147483648', '-2147483649'])('rejects invalid floors: %s', (floor) => {
  expect(roomFilterSchema.safeParse({ minCapacity: '', floor }).success).toBe(false);
});

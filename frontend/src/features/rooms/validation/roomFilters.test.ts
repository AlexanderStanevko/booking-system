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

it('rejects nonpositive, malformed and overflowing capacity filters', () => {
  for (const minCapacity of ['0', '-1', '1.5', 'invalid', '1e2', '2147483648']) {
    expect(roomFilterSchema.safeParse({ minCapacity, floor: '' }).success, minCapacity).toBe(false);
  }
});

it('requires a whole floor within the API integer range', () => {
  for (const floor of ['1.5', 'invalid', '2147483648', '-2147483649']) {
    expect(roomFilterSchema.safeParse({ minCapacity: '', floor }).success, floor).toBe(false);
  }
});

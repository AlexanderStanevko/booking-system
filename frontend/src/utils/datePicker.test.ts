import { expect, it } from 'vitest';
import { fromPickerDate, toPickerDate } from './datePicker';
import { isValidLocalDateTime } from './dates';

it.each(['2026-01-15T10:30', '2026-01-15T10:30:12', '2026-01-15T10:30:12.123'])(
  'round-trips picker wall time without losing precision: %s',
  (value) => {
    expect(fromPickerDate(toPickerDate(value), value)).toBe(value);
  },
);

it('accepts shorter fractional seconds', () => {
  const value = '2026-01-15T10:30:12.1';
  expect(fromPickerDate(toPickerDate(value), value)).toBe(value);
  expect(toPickerDate(value)?.millisecond()).toBe(100);
});

it('uses minute precision after changing the visible date or time', () => {
  expect(fromPickerDate(toPickerDate('2026-01-15T10:31:12.123'), '2026-01-15T10:30:12.123')).toBe(
    '2026-01-15T10:31',
  );
});

it('restores original precision when returning to the original displayed minute', () => {
  const original = '2026-01-15T08:30:12.1234567Z';
  expect(fromPickerDate(toPickerDate('2026-01-15T10:30'), '2026-01-15T10:31', original)).toBe(
    '2026-01-15T10:30:12.123',
  );
});

it.each(['2026-02-30T10:30', '10000-01-15T10:30', 'Invalid date'])(
  'does not turn malformed picker input into a valid value: %s',
  (value) => {
    expect(fromPickerDate(toPickerDate(value))).toBe('Invalid date');
  },
);

it('keeps nonexistent wall times intact so validation can reject them', () => {
  const value = fromPickerDate(toPickerDate('2026-03-29T03:30'));
  expect(value).toBe('2026-03-29T03:30');
  expect(isValidLocalDateTime(value)).toBe(false);
});

it('clears a picker without producing an invalid timestamp', () => {
  expect(toPickerDate('')).toBeNull();
  expect(fromPickerDate(null)).toBe('');
});

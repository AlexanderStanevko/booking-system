import { expect, it } from 'vitest';
import { fromPickerDate, toPickerDate } from './datePicker';
import { isValidLocalDateTime } from './dates';

it('round-trips supported wall-time precision, including shorter fractional seconds', () => {
  for (const value of [
    '2026-01-15T10:30',
    '2026-01-15T10:30:12',
    '2026-01-15T10:30:12.123',
    '2026-01-15T10:30:12.1',
  ]) {
    expect(fromPickerDate(toPickerDate(value), value), value).toBe(value);
  }
  expect(toPickerDate('2026-01-15T10:30:12.1')?.millisecond()).toBe(100);
});

it('uses minute precision for changed values and restores original precision on return', () => {
  expect(fromPickerDate(toPickerDate('2026-01-15T10:31:12.123'), '2026-01-15T10:30:12.123')).toBe(
    '2026-01-15T10:31',
  );
  const original = '2026-01-15T08:30:12.1234567Z';
  expect(fromPickerDate(toPickerDate('2026-01-15T10:30'), '2026-01-15T10:31', original)).toBe(
    '2026-01-15T10:30:12.123',
  );
});

it('keeps malformed and nonexistent wall times invalid for validation', () => {
  for (const value of ['2026-02-30T10:30', '10000-01-15T10:30', 'Invalid date']) {
    expect(fromPickerDate(toPickerDate(value)), value).toBe('Invalid date');
  }
  const value = fromPickerDate(toPickerDate('2026-03-29T03:30'));
  expect(value).toBe('2026-03-29T03:30');
  expect(isValidLocalDateTime(value)).toBe(false);
});

it('clears a picker without producing an invalid timestamp', () => {
  expect(toPickerDate('')).toBeNull();
  expect(fromPickerDate(null)).toBe('');
});

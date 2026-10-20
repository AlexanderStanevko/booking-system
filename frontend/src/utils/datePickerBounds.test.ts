import { expect, it } from 'vitest';
import { dateTimeConstraints, toPickerDate } from './datePicker';
import { millisecondsPerDay, toLocalDateTime } from './dates';

const now = Date.parse('2026-01-15T08:30:15Z');
const bounds = { after: now, through: now + 90 * millisecondsPerDay };

function disabled(value: string, currentValue = '', original?: string) {
  const date = toPickerDate(value);
  if (!date) throw new Error('A test date is required.');
  return dateTimeConstraints(bounds, currentValue, original).shouldDisableTime(date, 'minutes');
}

it('disables elapsed minutes and exposes the next available minute', () => {
  const constraints = dateTimeConstraints(bounds, '');
  expect(constraints.minDateTime?.format('YYYY-MM-DDTHH:mm')).toBe('2026-01-15T10:31');
  expect(disabled('2026-01-15T10:29')).toBe(true);
  expect(disabled('2026-01-15T10:30')).toBe(true);
  expect(disabled('2026-01-15T10:31')).toBe(false);
});

it('disables elapsed hours but keeps an hour with available minutes', () => {
  const constraints = dateTimeConstraints(bounds, '');
  for (const [value, expected] of [
    ['2026-01-15T09:00', true],
    ['2026-01-15T10:00', false],
  ] as const) {
    const date = toPickerDate(value);
    if (!date) throw new Error('A test date is required.');
    expect(constraints.shouldDisableTime(date, 'hours')).toBe(expected);
  }
});

it('uses the actual elapsed booking horizon across daylight saving changes', () => {
  const maximum = dateTimeConstraints(bounds, '').maxDateTime;
  expect(maximum?.format('YYYY-MM-DDTHH:mm')).toBe('2026-04-15T11:30');
  expect(disabled('2026-04-15T11:30')).toBe(false);
  expect(disabled('2026-04-15T11:31')).toBe(true);
});

it('preserves a valid existing timestamp within the current minute', () => {
  const original = '2026-01-15T08:30:45.1234567Z';
  const value = toLocalDateTime(original);
  expect(disabled(value, value, original)).toBe(false);
  expect(dateTimeConstraints(bounds, value, original).minDateTime?.second()).toBe(45);
});

it('allows returning to the valid original minute after editing another minute', () => {
  const original = '2026-01-15T08:30:45.1234567Z';
  expect(disabled('2026-01-15T10:30', '2026-01-15T10:31', original)).toBe(false);
  expect(dateTimeConstraints(bounds, '2026-01-15T10:31', original).minDateTime?.second()).toBe(45);
});

it('preserves an existing end later in the same displayed minute as its start', () => {
  const original = '2026-01-15T08:30:45.1234567Z';
  const value = toLocalDateTime(original);
  const constraints = dateTimeConstraints({ after: now }, value, original);
  const date = toPickerDate(value);
  if (!date) throw new Error('A test date is required.');
  expect(constraints.shouldDisableTime(date, 'minutes')).toBe(false);
});

it('keeps historical filter ranges and disables equal or earlier ends', () => {
  const after = Date.parse('2020-01-15T08:30:00Z');
  const constraints = dateTimeConstraints({ after }, '');
  for (const [value, expected] of [
    ['2020-01-15T10:29', true],
    ['2020-01-15T10:30', true],
    ['2020-01-15T10:31', false],
  ] as const) {
    const date = toPickerDate(value);
    if (!date) throw new Error('A test date is required.');
    expect(constraints.shouldDisableTime(date, 'minutes')).toBe(expected);
  }
  expect(dateTimeConstraints({}, '').minDateTime).toBeUndefined();
});

it('rejects nonexistent DST times and preserves the original repeated-time occurrence', () => {
  const gap = toPickerDate('2026-03-29T03:30');
  if (!gap) throw new Error('A test date is required.');
  expect(dateTimeConstraints({}, '').shouldDisableTime(gap, 'minutes')).toBe(true);
  const original = '2026-10-25T01:30:12.1234567Z';
  const value = toLocalDateTime(original);
  const date = toPickerDate(value);
  if (!date) throw new Error('A test date is required.');
  const repeated = dateTimeConstraints(
    { after: Date.parse('2026-10-25T00:45:00Z') },
    value,
    original,
  );
  expect(repeated.shouldDisableTime(date, 'minutes')).toBe(false);
  expect(repeated.shouldDisableTime(date.add(1, 'minute'), 'minutes')).toBe(true);
});

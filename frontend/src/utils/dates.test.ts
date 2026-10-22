import { expect, it } from 'vitest';
import {
  dateRangeError,
  dateRangeParameters,
  formatDateTime,
  isValidLocalDateTime,
  repeatedTimeHint,
  toLocalDateTime,
  toUtcTimestamp,
} from './dates';

it('converts between local time and UTC with precision and seasonal offsets', () => {
  expect(toLocalDateTime('2026-01-15T08:30:12.123Z')).toBe('2026-01-15T10:30:12.123');
  expect(formatDateTime('2026-01-15T08:30:00Z')).toBe('15 Jan 2026, 10:30');
  expect(toUtcTimestamp('2026-01-15T10:30:12.123')).toBe('2026-01-15T08:30:12.123Z');
  expect(toUtcTimestamp('2026-07-15T10:30')).toBe('2026-07-15T07:30:00.000Z');
});

it('rejects malformed dates and calendar/year bounds without silently normalizing them', () => {
  for (const value of [
    '',
    'bad date',
    '2026-02-30T10:00',
    '10000-01-01T10:00',
    '026-01-01T10:00',
    '1899-12-31T10:00',
    '2100-01-01T10:00',
    '2026-01-15T24:30',
  ]) {
    expect(isValidLocalDateTime(value), value).toBe(false);
    expect(() => toUtcTimestamp(value), value).toThrow();
  }
});

it('rejects spring gaps and discloses the earlier occurrence of repeated autumn times', () => {
  expect(isValidLocalDateTime('2026-03-29T03:30')).toBe(false);
  expect(() => toUtcTimestamp('2026-03-29T03:30')).toThrow();
  expect(toUtcTimestamp('2026-10-25T03:30')).toBe('2026-10-25T00:30:00.000Z');
  expect(repeatedTimeHint('2026-10-25T03:30')).toContain('earlier occurrence');
  expect(repeatedTimeHint('2026-10-25T05:30')).toBeUndefined();
});

it('supports historical/open-ended filters and rejects invalid or unordered ends', () => {
  expect(dateRangeError({ from: '2020-01-01T10:00', to: '' })).toBeNull();
  expect(dateRangeParameters({ from: '', to: '' })).toEqual({ from: undefined, to: undefined });
  expect(dateRangeParameters({ from: '2020-01-01T10:00', to: '' }).from).toBe(
    '2020-01-01T08:00:00.000Z',
  );
  for (const to of ['2026-01-15T09:00', '2026-01-15T10:00', 'invalid']) {
    expect(dateRangeError({ from: '2026-01-15T10:00', to }), to).not.toBeNull();
  }
});

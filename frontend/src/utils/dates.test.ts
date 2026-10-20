import { describe, expect, it } from 'vitest';
import {
  dateRangeError,
  dateRangeParameters,
  formatDateTime,
  isValidLocalDateTime,
  repeatedTimeHint,
  reservationTimestamp,
  toLocalDateTime,
  toUtcTimestamp,
} from './dates';

describe('local dates and UTC conversion', () => {
  it('formats local dates and preserves seconds and milliseconds', () => {
    expect(toLocalDateTime('2026-01-15T08:30:12.123Z')).toBe('2026-01-15T10:30:12.123');
    expect(formatDateTime('2026-01-15T08:30:00Z')).toBe('15 Jan 2026, 10:30');
    expect(toUtcTimestamp('2026-01-15T10:30:12.123')).toBe('2026-01-15T08:30:12.123Z');
  });

  it('uses the seasonal timezone offset', () => {
    expect(toUtcTimestamp('2026-07-15T10:30')).toBe('2026-07-15T07:30:00.000Z');
  });

  it.each([
    '',
    'bad date',
    '2026-02-30T10:00',
    '10000-01-01T10:00',
    '026-01-01T10:00',
    '1899-12-31T10:00',
    '2100-01-01T10:00',
    '2026-01-15T24:30',
  ])('rejects invalid or out-of-range input: %s', (value) => {
    expect(isValidLocalDateTime(value)).toBe(false);
    expect(() => toUtcTimestamp(value)).toThrow();
  });

  it('rejects nonexistent spring-forward times instead of shifting them', () => {
    expect(isValidLocalDateTime('2026-03-29T03:30')).toBe(false);
    expect(() => toUtcTimestamp('2026-03-29T03:30')).toThrow();
  });

  it('discloses the earlier occurrence for repeated times', () => {
    expect(toUtcTimestamp('2026-10-25T03:30')).toBe('2026-10-25T00:30:00.000Z');
    expect(repeatedTimeHint('2026-10-25T03:30')).toContain('earlier occurrence');
    expect(repeatedTimeHint('2026-10-25T05:30')).toBeUndefined();
  });

  it('preserves an unchanged later occurrence and full server precision', () => {
    const original = '2026-10-25T01:30:12.1234567Z';
    expect(reservationTimestamp(toLocalDateTime(original), original)).toBe(original);
    expect(reservationTimestamp('2026-10-25T05:30', original)).toBe('2026-10-25T03:30:00.000Z');
  });
});

describe('date range filters', () => {
  it('accepts historical and open-ended ranges', () => {
    expect(dateRangeError({ from: '2020-01-01T10:00', to: '' })).toBeNull();
    expect(dateRangeParameters({ from: '', to: '' })).toEqual({ from: undefined, to: undefined });
    expect(dateRangeParameters({ from: '2020-01-01T10:00', to: '' }).from).toBe(
      '2020-01-01T08:00:00.000Z',
    );
  });

  it.each(['2026-01-15T09:00', '2026-01-15T10:00', 'invalid'])(
    'rejects invalid range end: %s',
    (to) => {
      expect(dateRangeError({ from: '2026-01-15T10:00', to })).not.toBeNull();
    },
  );
});

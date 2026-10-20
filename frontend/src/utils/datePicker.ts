import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  dateInputYears,
  isValidLocalDateTime,
  millisecondsPerMinute,
  reservationTimestamp,
  toLocalDateTime,
} from './dates';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const localFormats = ['YYYY-MM-DDTHH:mm', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSS'];

export const pickerBounds = {
  min: dayjs.utc(`${dateInputYears.min}-01-01`),
  max: dayjs.utc(`${dateInputYears.max}-12-31`).endOf('day'),
};

export function toPickerDate(value: string): Dayjs | null {
  if (!value) return null;
  const normalized = value.replace(
    /\.(\d{1,2})$/,
    (_, fraction: string) => `.${fraction.padEnd(3, '0')}`,
  );
  const format = localFormats.find((format) => format.length === normalized.length);
  return format ? dayjs.utc(normalized, format, true) : dayjs.utc('Invalid date');
}

export function fromPickerDate(value: Dayjs | null, currentValue = '', original?: string): string {
  if (!value) return '';
  if (!value.isValid()) return 'Invalid date';
  const minute = value.format('YYYY-MM-DDTHH:mm');
  const originalValue = original ? toLocalDateTime(original) : '';
  if (minute === originalValue.slice(0, 16)) return originalValue;
  return isValidLocalDateTime(currentValue) && minute === currentValue.slice(0, 16)
    ? currentValue
    : minute;
}

export interface DateTimeBounds {
  after?: number;
  through?: number;
}

const nextMinute = (timestamp: number) =>
  (Math.floor(timestamp / millisecondsPerMinute) + 1) * millisecondsPerMinute;

function pickerInstant(timestamp: number): Dayjs {
  return dayjs.utc(toLocalDateTime(new Date(timestamp).toISOString()));
}

function allowedTimestamp(value: string, bounds: DateTimeBounds, original?: string): number | null {
  if (!isValidLocalDateTime(value)) return null;
  const timestamp = Date.parse(reservationTimestamp(value, original));
  if (bounds.after !== undefined && timestamp <= bounds.after) return null;
  if (bounds.through !== undefined && timestamp > bounds.through) return null;
  return timestamp;
}

export function dateTimeConstraints(
  bounds: DateTimeBounds,
  currentValue: string,
  original?: string,
) {
  let minDateTime =
    bounds.after === undefined ? undefined : pickerInstant(nextMinute(bounds.after));
  let maxDateTime =
    bounds.through === undefined
      ? undefined
      : pickerInstant(Math.floor(bounds.through / millisecondsPerMinute) * millisecondsPerMinute);
  const originalValue = original ? toLocalDateTime(original) : '';
  const originalDate = toPickerDate(originalValue);
  const originalAllowed = !!original && allowedTimestamp(originalValue, bounds, original) !== null;
  if (originalAllowed && originalDate?.isValid()) {
    if (minDateTime && originalDate.isBefore(minDateTime)) minDateTime = originalDate;
    if (maxDateTime && originalDate.isAfter(maxDateTime)) maxDateTime = originalDate;
  }
  return {
    minDateTime,
    maxDateTime,
    shouldDisableTime: (date: Dayjs, view: 'hours' | 'minutes' | 'seconds') => {
      if (view === 'seconds') return false;
      if (view === 'minutes')
        return (
          allowedTimestamp(fromPickerDate(date, currentValue, original), bounds, original) === null
        );
      if (originalAllowed && originalDate?.isSame(date, 'hour')) return false;
      const first = fromPickerDate(date.startOf('hour'));
      const last = fromPickerDate(date.endOf('hour').startOf('minute'));
      if (!isValidLocalDateTime(first) || !isValidLocalDateTime(last)) return true;
      return (
        (bounds.after !== undefined && Date.parse(reservationTimestamp(last)) <= bounds.after) ||
        (bounds.through !== undefined && Date.parse(reservationTimestamp(first)) > bounds.through)
      );
    },
  };
}

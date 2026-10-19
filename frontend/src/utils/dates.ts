const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
export const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function formatDate(value: string): string {
  return dateFormat.format(new Date(value));
}

export function formatTime(value: string): string {
  return timeFormat.format(new Date(value));
}

export function formatDateTime(value: string): string {
  return `${formatDate(value)}, ${formatTime(value)}`;
}

export function toLocalDateTime(value: string): string {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, '0');
  const local = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (!date.getSeconds() && !date.getMilliseconds()) return local;
  const milliseconds = date.getMilliseconds()
    ? `.${String(date.getMilliseconds()).padStart(3, '0').replace(/0+$/, '')}`
    : '';
  return `${local}:${pad(date.getSeconds())}${milliseconds}`;
}

export function isValidLocalDateTime(value: string): boolean {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(
    value,
  );
  if (!parts) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const expected = [
    Number(parts[1]),
    Number(parts[2]),
    Number(parts[3]),
    Number(parts[4]),
    Number(parts[5]),
    Number(parts[6] ?? 0),
    Number((parts[7] ?? '').padEnd(3, '0')),
  ];
  const actual = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  ];
  return expected.every((part, index) => part === actual[index]);
}

export function toUtcTimestamp(value: string): string {
  if (!isValidLocalDateTime(value)) throw new Error('Choose a valid local date and time.');
  return new Date(value).toISOString();
}

export interface DateRangeValues {
  from: string;
  to: string;
}

export function dateRangeError({ from, to }: DateRangeValues): string | null {
  if ((from && !isValidLocalDateTime(from)) || (to && !isValidLocalDateTime(to))) {
    return 'Choose valid local dates and times.';
  }
  if (from && to && new Date(to) <= new Date(from)) {
    return 'The range end must be later than its start.';
  }
  return null;
}

export function dateRangeParameters({ from, to }: DateRangeValues) {
  return {
    from: from ? toUtcTimestamp(from) : undefined,
    to: to ? toUtcTimestamp(to) : undefined,
  };
}

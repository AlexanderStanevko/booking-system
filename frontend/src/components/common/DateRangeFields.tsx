import { DateTimeInput } from './DateTimeInput';
import type { DateRangeValues } from '../../utils/dates';
import { dateRangeError, isValidLocalDateTime, toUtcTimestamp } from '../../utils/dates';

interface Props {
  value: DateRangeValues;
  onChange: (value: DateRangeValues) => void;
}

export function DateRangeFields({ value, onChange }: Props) {
  const rangeError =
    isValidLocalDateTime(value.from) && isValidLocalDateTime(value.to)
      ? dateRangeError(value)
      : null;
  return (
    <>
      <DateTimeInput
        label="From"
        value={value.from}
        onChange={(from) => onChange({ ...value, from })}
      />
      <DateTimeInput
        label="To"
        value={value.to}
        bounds={{
          after: isValidLocalDateTime(value.from)
            ? Date.parse(toUtcTimestamp(value.from))
            : undefined,
        }}
        error={rangeError ?? undefined}
        onChange={(to) => onChange({ ...value, to })}
      />
    </>
  );
}

import { TextField } from '@mui/material';
import type { DateRangeValues } from '../../utils/dates';

interface Props {
  value: DateRangeValues;
  onChange: (value: DateRangeValues) => void;
}

export function DateRangeFields({ value, onChange }: Props) {
  return (
    <>
      <TextField
        label="From"
        type="datetime-local"
        value={value.from}
        onChange={(event) => onChange({ ...value, from: event.target.value })}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 'any' } }}
      />
      <TextField
        label="To"
        type="datetime-local"
        value={value.to}
        onChange={(event) => onChange({ ...value, to: event.target.value })}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 'any' } }}
      />
    </>
  );
}

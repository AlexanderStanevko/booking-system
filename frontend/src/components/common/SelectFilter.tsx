import { useId } from 'react';
import { TextField } from '@mui/material';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  emptyLabel: string;
}

export function SelectFilter({ label, value, onChange, options, emptyLabel }: Props) {
  const id = useId();
  return (
    <TextField
      id={id}
      select
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
    >
      <option value="">{emptyLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </TextField>
  );
}

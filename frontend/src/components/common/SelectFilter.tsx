import { useId } from 'react';
import { Autocomplete, MenuItem, TextField } from '@mui/material';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  emptyLabel: string;
  searchable?: boolean;
}

export function SelectFilter({ label, value, onChange, options, emptyLabel, searchable }: Props) {
  const id = useId();
  const choices = [{ value: '', label: emptyLabel }, ...options];
  if (searchable) {
    return (
      <Autocomplete
        id={id}
        options={choices}
        value={choices.find((option) => option.value === value) ?? null}
        onChange={(_, option) => onChange(option?.value ?? '')}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        renderInput={(params) => <TextField {...params} label={label} />}
      />
    );
  }
  return (
    <TextField
      id={id}
      select
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
    >
      {choices.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

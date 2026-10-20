import { useState } from 'react';
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { FilterPanel } from '../../../components/common/FilterPanel';
import { roomFilterSchema } from '../validation/roomFilters';
import {
  equipmentLabels,
  equipmentSchema,
  type Equipment,
  type RoomFilters as Filters,
} from '../types/room';

export function RoomFilters({ onApply }: { onApply: (filters: Filters) => void }) {
  const [minCapacity, setMinCapacity] = useState('');
  const [floor, setFloor] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [errors, setErrors] = useState<{ minCapacity?: string; floor?: string }>({});
  function validate() {
    const result = roomFilterSchema.safeParse({ minCapacity, floor });
    setErrors(
      result.success
        ? {}
        : {
            minCapacity: result.error.issues.find((issue) => issue.path[0] === 'minCapacity')
              ?.message,
            floor: result.error.issues.find((issue) => issue.path[0] === 'floor')?.message,
          },
    );
    return result;
  }
  function apply() {
    const result = validate();
    if (!result.success) return;
    onApply({ ...result.data, equipment: equipment.length ? equipment : undefined });
  }
  function reset() {
    setMinCapacity('');
    setFloor('');
    setEquipment([]);
    setErrors({});
    onApply({});
  }
  return (
    <FilterPanel onReset={reset} onApply={apply}>
      <TextField
        label="Minimum capacity"
        placeholder="Any capacity"
        value={minCapacity}
        onChange={(event) => setMinCapacity(event.target.value)}
        onBlur={validate}
        error={!!errors.minCapacity}
        helperText={errors.minCapacity}
        slotProps={{ htmlInput: { inputMode: 'numeric' } }}
      />
      <FormControl>
        <InputLabel id="equipment-label">Equipment</InputLabel>
        <Select<Equipment[]>
          labelId="equipment-label"
          label="Equipment"
          multiple
          value={equipment}
          onChange={(event) =>
            setEquipment(
              equipmentSchema
                .array()
                .parse(
                  typeof event.target.value === 'string'
                    ? event.target.value.split(',')
                    : event.target.value,
                ),
            )
          }
          renderValue={(selected) => selected.map((item) => equipmentLabels[item]).join(', ')}
        >
          {equipmentSchema.options.map((item) => (
            <MenuItem key={item} value={item}>
              <Checkbox checked={equipment.includes(item)} />
              <ListItemText primary={equipmentLabels[item]} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Floor"
        placeholder="Any floor"
        value={floor}
        onChange={(event) => setFloor(event.target.value)}
        onBlur={validate}
        error={!!errors.floor}
        helperText={errors.floor}
        slotProps={{ htmlInput: { inputMode: 'numeric' } }}
      />
    </FilterPanel>
  );
}

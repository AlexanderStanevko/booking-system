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
  function reset() {
    setMinCapacity('');
    setFloor('');
    setEquipment([]);
    onApply({});
  }
  return (
    <FilterPanel
      onReset={reset}
      onApply={() =>
        onApply({
          minCapacity: minCapacity ? Number(minCapacity) : undefined,
          floor: floor ? Number(floor) : undefined,
          equipment: equipment.length ? equipment : undefined,
        })
      }
    >
      <TextField
        label="Minimum capacity"
        type="number"
        placeholder="Any capacity"
        value={minCapacity}
        onChange={(event) => setMinCapacity(event.target.value)}
        slotProps={{ htmlInput: { min: 1, step: 1 } }}
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
        type="number"
        placeholder="Any floor"
        value={floor}
        onChange={(event) => setFloor(event.target.value)}
        slotProps={{ htmlInput: { step: 1 } }}
      />
    </FilterPanel>
  );
}

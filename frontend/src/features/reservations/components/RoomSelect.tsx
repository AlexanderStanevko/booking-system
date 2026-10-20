import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import type { Ref } from 'react';
import { equipmentNames, type Room } from '@/features/rooms/types/room';

interface Props {
  rooms: Room[];
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
  error?: string;
}

const roomDetails = (room: Room) =>
  [
    `${room.capacity} people`,
    `Floor ${room.floor}`,
    room.location,
    ...equipmentNames(room.equipment),
    room.isActive ? 'Active' : 'Inactive',
  ].join(' · ');

export function RoomSelect({ rooms, value, onChange, onBlur, inputRef, error }: Props) {
  const selected = rooms.find((room) => room.id === value) ?? null;
  return (
    <Autocomplete
      options={rooms}
      value={selected}
      onChange={(_, room) => onChange(room?.id ?? '')}
      onBlur={onBlur}
      getOptionLabel={(room) => room.name}
      getOptionDisabled={(room) => !room.isActive}
      isOptionEqualToValue={(room, value) => room.id === value.id}
      renderOption={({ key, ...props }, room) => (
        <Box component="li" key={key} {...props} sx={{ gap: 2, justifyContent: 'space-between' }}>
          <Typography variant="body2" noWrap>
            {room.name}
            {!room.isActive && ' (inactive)'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 'auto' }}>
            {room.capacity} people
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          label="Room"
          error={!!error}
          helperText={error ?? (selected && roomDetails(selected))}
        />
      )}
    />
  );
}

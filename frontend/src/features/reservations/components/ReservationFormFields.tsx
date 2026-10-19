import { Box, TextField } from '@mui/material';
import { Controller, useWatch, type Control } from 'react-hook-form';
import type { Room } from '../../rooms/types/room';
import type { User } from '../../users/types/user';
import type { ReservationFormResult, ReservationFormValues } from '../validation/reservationForm';

const textFields = [
  { name: 'startTime', label: 'Start date and time', type: 'datetime-local' },
  { name: 'endTime', label: 'End date and time', type: 'datetime-local' },
  { name: 'attendeeCount', label: 'Number of attendees', type: 'number' },
] as const;

interface Props {
  control: Control<ReservationFormValues, undefined, ReservationFormResult>;
  rooms: Room[];
  users: User[];
}

export function ReservationFormFields({ control, rooms, users }: Props) {
  const roomId = useWatch({ control, name: 'roomId' });
  const room = rooms.find((item) => item.id === roomId);
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
      <Controller
        name="title"
        control={control}
        render={({ field: { ref, ...field }, fieldState }) => (
          <TextField
            {...field}
            inputRef={ref}
            label="Meeting title"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            sx={{ gridColumn: '1 / -1' }}
          />
        )}
      />
      <Controller
        name="roomId"
        control={control}
        render={({ field: { ref, ...field }, fieldState }) => (
          <TextField
            {...field}
            inputRef={ref}
            id="reservation-room"
            select
            label="Room"
            error={!!fieldState.error}
            helperText={
              fieldState.error?.message ??
              (room && `Capacity: ${room.capacity} people · Floor ${room.floor}`)
            }
            slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
          >
            <option value="">Choose a room</option>
            {rooms.map((item) => (
              <option key={item.id} value={item.id} disabled={!item.isActive}>
                {item.name}
                {!item.isActive && ' (inactive)'}
              </option>
            ))}
          </TextField>
        )}
      />
      <Controller
        name="organizerId"
        control={control}
        render={({ field: { ref, ...field }, fieldState }) => (
          <TextField
            {...field}
            inputRef={ref}
            id="reservation-organizer"
            select
            label="Organizer"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
          >
            <option value="">Choose an organizer</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </TextField>
        )}
      />
      {textFields.map(({ name, label, type }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field: { ref, ...field }, fieldState }) => (
            <TextField
              {...field}
              inputRef={ref}
              label={label}
              type={type}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: type === 'number' ? { min: 1, step: 1 } : { step: 'any' },
              }}
            />
          )}
        />
      ))}
    </Box>
  );
}

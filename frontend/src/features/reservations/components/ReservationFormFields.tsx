import { Box, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { DateTimeInput } from '@/components/common/DateTimeInput';
import { millisecondsPerDay } from '@/utils/dates';
import type { Room } from '@/features/rooms/types/room';
import type { User } from '@/features/users/types/user';
import type { ReservationForm } from '../hooks/useReservationForm';
import type { Reservation } from '../types/reservation';
import { RoomSelect } from './RoomSelect';
import type { BookingConfiguration } from '../hooks/useBookingConfiguration';

const textFields = [
  { name: 'startTime', label: 'Start date and time' },
  { name: 'endTime', label: 'End date and time' },
] as const;

interface Props {
  form: ReservationForm;
  rooms: Room[];
  users: User[];
  reservation?: Reservation;
  configuration: BookingConfiguration;
}

export function ReservationFormFields({ form, rooms, users, reservation, configuration }: Props) {
  const { control, now, startTimestamp } = form;
  const dateBounds = {
    startTime: {
      after: now,
      through: now + configuration.maxAdvanceBookingDays * millisecondsPerDay,
    },
    endTime: {
      after: Math.max(startTimestamp ?? now, now),
      through:
        startTimestamp === undefined
          ? undefined
          : startTimestamp + configuration.maxDurationDays * millisecondsPerDay,
    },
  };
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
          <RoomSelect
            {...field}
            inputRef={ref}
            rooms={rooms}
            error={fieldState.error?.message}
            onChange={(value) => {
              field.onChange(value);
              void form.trigger('attendeeCount');
            }}
          />
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
      {textFields.map(({ name, label }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field: { ref, ...field }, fieldState }) => (
            <DateTimeInput
              {...field}
              inputRef={ref}
              label={label}
              error={fieldState.error?.message}
              originalTimestamp={reservation?.[name]}
              bounds={dateBounds[name]}
              onOpenChange={form.onPickerOpenChange}
              onChange={(value) => {
                field.onChange(value);
                if (name === 'startTime' && form.getValues('endTime')) void form.trigger('endTime');
              }}
            />
          )}
        />
      ))}
      <Controller
        name="attendeeCount"
        control={control}
        render={({ field: { ref, ...field }, fieldState }) => (
          <TextField
            {...field}
            inputRef={ref}
            label="Number of attendees"
            type="number"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />
        )}
      />
    </Box>
  );
}

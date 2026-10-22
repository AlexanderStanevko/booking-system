import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { ApiErrorMessage } from '@/components/common/ApiErrorMessage';
import { AppIcon } from '@/components/common/AppIcon';
import { localTimeZone } from '@/utils/dates';
import type { Room } from '@/features/rooms/types/room';
import type { User } from '@/features/users/types/user';
import { useSaveReservation } from '../hooks/useReservationMutations';
import { useReservationForm } from '../hooks/useReservationForm';
import type { BookingConfiguration } from '../hooks/useBookingConfiguration';
import type { Reservation } from '../types/reservation';
import { reservationFormRequest } from '../validation/reservationForm';
import { ReservationFormFields } from './ReservationFormFields';

interface Props {
  reservation?: Reservation;
  rooms: Room[];
  users: User[];
  configuration: BookingConfiguration;
  onClose: () => void;
  onSaved: (message: string, createdReservationId?: string) => void;
}

export function ReservationFormDialog({
  reservation,
  rooms,
  users,
  configuration,
  onClose,
  onSaved,
}: Props) {
  const mutation = useSaveReservation();
  const form = useReservationForm({ reservation, rooms, users, configuration });
  const submit = form.handleSubmit((values) =>
    mutation.mutate(
      {
        id: reservation?.id,
        values: reservationFormRequest(values, reservation),
      },
      {
        onSuccess: (saved) =>
          onSaved(
            reservation ? 'Reservation updated.' : 'Reservation created.',
            reservation ? undefined : saved.id,
          ),
      },
    ),
  );
  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={mutation.isPending ? undefined : onClose}
      aria-labelledby="reservation-form-title"
    >
      <DialogTitle id="reservation-form-title" sx={{ pr: 7 }}>
        {reservation ? 'Edit reservation' : 'New reservation'}
        <IconButton
          aria-label="Close reservation form"
          onClick={onClose}
          disabled={mutation.isPending}
          sx={{ position: 'absolute', right: 2, top: 2 }}
        >
          <AppIcon name="close" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={submit} noValidate>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose a room and add your meeting details.
          </Typography>
          {mutation.error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <ApiErrorMessage error={mutation.error} />
            </Alert>
          )}
          <Box
            component="fieldset"
            disabled={mutation.isPending}
            sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
          >
            <ReservationFormFields
              form={form}
              rooms={rooms}
              users={users}
              reservation={reservation}
              configuration={configuration}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2.5 }}>
            Local timezone: {localTimeZone.replaceAll('_', ' ')}.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button color="inherit" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save reservation'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

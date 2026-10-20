import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { errorMessage } from '@/api/errors';
import { useReservationAction } from '../hooks/useReservationMutations';
import type { Reservation } from '../types/reservation';

const actionDetails = {
  cancel: {
    title: 'Cancel reservation?',
    label: 'Cancel reservation',
    dismiss: 'Keep reservation',
    success: 'Reservation cancelled.',
    description: 'The room will become available, and the reservation will remain in history.',
  },
  complete: {
    title: 'End this meeting?',
    label: 'End meeting',
    dismiss: 'Keep meeting',
    success: 'Meeting ended. Its end time has been recorded.',
    description:
      'The current time will be recorded as the end of this meeting. The scheduled end time will be preserved.',
  },
};

interface Props {
  action: 'cancel' | 'complete';
  reservation: Reservation;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function ReservationConfirmation({ action, reservation, onClose, onSaved }: Props) {
  const mutation = useReservationAction();
  const details = actionDetails[action];
  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      onClose={mutation.isPending ? undefined : onClose}
      aria-labelledby="reservation-confirm-title"
    >
      <DialogTitle id="reservation-confirm-title">{details.title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          <strong>{reservation.title}</strong>
        </DialogContentText>
        <DialogContentText>{details.description}</DialogContentText>
        {mutation.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage(mutation.error)}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button color="inherit" onClick={onClose} disabled={mutation.isPending}>
          {details.dismiss}
        </Button>
        <Button
          variant="contained"
          color={action === 'cancel' ? 'error' : 'primary'}
          disabled={mutation.isPending}
          onClick={() =>
            mutation.mutate(
              { id: reservation.id, action },
              { onSuccess: () => onSaved(details.success) },
            )
          }
        >
          {mutation.isPending ? 'Saving…' : details.label}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

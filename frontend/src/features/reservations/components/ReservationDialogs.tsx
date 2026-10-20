import { lazy, Suspense } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { QueryState } from '@/components/common/QueryState';
import type { Room } from '@/features/rooms/types/room';
import type { User } from '@/features/users/types/user';
import { useReservation } from '../hooks/useReservations';
import { useBookingConfiguration } from '../hooks/useBookingConfiguration';
import type { ReservationDialog } from '../types/reservation';
import { ReservationConfirmation } from './ReservationConfirmation';

const ReservationFormDialog = lazy(() =>
  import('./ReservationFormDialog').then((module) => ({ default: module.ReservationFormDialog })),
);

interface Props {
  dialog: ReservationDialog | null;
  rooms: Room[];
  users: User[];
  onClose: () => void;
  onSaved: (message: string, createdReservationId?: string) => void;
}

export function ReservationDialogs({ dialog, rooms, users, onClose, onSaved }: Props) {
  const needsForm = dialog?.kind === 'create' || dialog?.kind === 'edit';
  const configuration = useBookingConfiguration(needsForm);
  const reservation = useReservation(
    dialog && dialog.kind !== 'create' ? dialog.reservationId : undefined,
  );
  if (!dialog) return null;
  const pending =
    (needsForm && configuration.isPending) ||
    (dialog.kind !== 'create' && (reservation.isPending || reservation.isFetching));
  const error = (needsForm && configuration.error) || reservation.error;
  if (pending || error) {
    return (
      <Dialog
        open
        fullWidth
        maxWidth="sm"
        onClose={onClose}
        aria-labelledby="reservation-details-title"
      >
        <DialogTitle id="reservation-details-title">Reservation details</DialogTitle>
        <DialogContent>
          <QueryState
            pending={pending}
            error={error || null}
            onRetry={() => {
              if (configuration.error) void configuration.refetch();
              if (reservation.error) void reservation.refetch();
            }}
          >
            {null}
          </QueryState>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
  if (needsForm && configuration.data)
    return (
      <Suspense
        fallback={
          <Dialog
            open
            fullWidth
            maxWidth="sm"
            onClose={onClose}
            aria-labelledby="reservation-form-loading-title"
          >
            <DialogTitle id="reservation-form-loading-title">
              {dialog.kind === 'edit' ? 'Edit reservation' : 'New reservation'}
            </DialogTitle>
            <DialogContent>
              <output aria-live="polite">Loading reservation form…</output>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Close</Button>
            </DialogActions>
          </Dialog>
        }
      >
        <ReservationFormDialog
          reservation={reservation.data}
          rooms={rooms}
          users={users}
          configuration={configuration.data}
          onClose={onClose}
          onSaved={onSaved}
        />
      </Suspense>
    );
  if (dialog.kind === 'create' || dialog.kind === 'edit' || !reservation.data) return null;
  return (
    <ReservationConfirmation
      action={dialog.kind}
      reservation={reservation.data}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

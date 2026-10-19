import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { QueryState } from '../../../components/common/QueryState';
import type { Room } from '../../rooms/types/room';
import type { User } from '../../users/types/user';
import { useReservation } from '../hooks/useReservations';
import type { Reservation, ReservationDialog } from '../types/reservation';
import { ReservationConfirmation } from './ReservationConfirmation';
import { ReservationFormDialog } from './ReservationFormDialog';

interface Props {
  dialog: ReservationDialog | null;
  reservations: Reservation[];
  rooms: Room[];
  users: User[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function ReservationDialogs({
  dialog,
  reservations,
  rooms,
  users,
  onClose,
  onSaved,
}: Props) {
  const reservationId = dialog && dialog.kind !== 'create' ? dialog.reservationId : undefined;
  const reservation = useReservation(
    reservationId,
    reservations.find((item) => item.id === reservationId),
  );
  if (!dialog) return null;
  if (dialog.kind === 'create')
    return (
      <ReservationFormDialog rooms={rooms} users={users} onClose={onClose} onSaved={onSaved} />
    );
  if (reservation.isPending || reservation.error || !reservation.data) {
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
            pending={reservation.isPending}
            error={reservation.error}
            onRetry={() => void reservation.refetch()}
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
  if (dialog.kind === 'edit')
    return (
      <ReservationFormDialog
        key={reservation.data.id}
        reservation={reservation.data}
        rooms={rooms}
        users={users}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
  return (
    <ReservationConfirmation
      action={dialog.kind}
      reservation={reservation.data}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

import { Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { DateTimeText } from '../../../components/common/DateTimeText';
import { formatDateTime } from '../../../utils/dates';
import { statusColors } from '../reservationPresentation';
import type { Reservation, ReservationAction } from '../types/reservation';
import { ReservationActions } from './ReservationActions';
import { useReservationSchedule } from '../hooks/useReservationSchedule';

interface Props {
  reservations: Reservation[];
  visibleReservations: Reservation[];
  onAction: (action: ReservationAction, reservation: Reservation) => void;
}

export function ReservationTable({ reservations, visibleReservations, onAction }: Props) {
  const now = useReservationSchedule(reservations);
  return (
    <Table aria-label="Reservations">
      <TableHead>
        <TableRow>
          {[
            'Meeting',
            'Room',
            'Organizer',
            'Start time',
            'End time',
            'Attendees',
            'Status',
            'Actions',
          ].map((heading) => (
            <TableCell key={heading}>{heading}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {visibleReservations.map((reservation) => (
          <TableRow key={reservation.id} hover>
            <TableCell sx={{ minWidth: 160 }}>
              <Typography variant="subtitle2">{reservation.title}</Typography>
            </TableCell>
            <TableCell>{reservation.roomName}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{reservation.organizerName}</TableCell>
            <TableCell>
              <DateTimeText value={reservation.startTime} />
            </TableCell>
            <TableCell>
              <DateTimeText value={reservation.endTime} />
              {reservation.actualEndTime && (
                <Typography component="div" variant="caption" color="primary" sx={{ mt: 0.5 }}>
                  Recorded end: {formatDateTime(reservation.actualEndTime)}
                </Typography>
              )}
            </TableCell>
            <TableCell>{reservation.attendeeCount}</TableCell>
            <TableCell>
              <Chip
                label={reservation.status}
                color={statusColors[reservation.status]}
                variant="outlined"
              />
            </TableCell>
            <TableCell>
              <ReservationActions
                reservation={reservation}
                now={now}
                onAction={(action) => onAction(action, reservation)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

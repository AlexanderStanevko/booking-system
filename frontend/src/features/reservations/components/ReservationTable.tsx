import { useEffect, useRef } from 'react';
import { Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { DateTimeText } from '@/components/common/DateTimeText';
import { formatDateTime } from '@/utils/dates';
import { statusColors } from '../reservationPresentation';
import type { Reservation, ReservationAction } from '../types/reservation';
import { ReservationActions } from './ReservationActions';
import { useReservationSchedule } from '../hooks/useReservationSchedule';

interface Props {
  reservations: Reservation[];
  visibleReservations: Reservation[];
  highlightedReservationId?: string | null;
  onAction: (action: ReservationAction, reservation: Reservation) => void;
}

export function ReservationTable({
  reservations,
  visibleReservations,
  highlightedReservationId,
  onAction,
}: Props) {
  const now = useReservationSchedule(reservations);
  const highlightedRow = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    highlightedRow.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [highlightedReservationId]);
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
          <TableRow
            key={reservation.id}
            hover={reservation.id !== highlightedReservationId}
            ref={reservation.id === highlightedReservationId ? highlightedRow : null}
            sx={
              reservation.id === highlightedReservationId
                ? {
                    bgcolor: 'action.selected',
                    scrollMarginBottom: '6rem',
                  }
                : undefined
            }
          >
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

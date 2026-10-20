import { Button, Stack, Typography } from '@mui/material';
import { AppIcon } from '@/components/common/AppIcon';
import { reservationEligibility } from '../reservationPresentation';
import type { Reservation, ReservationAction } from '../types/reservation';

interface Props {
  reservation: Reservation;
  now: number;
  onAction: (action: ReservationAction) => void;
}

export function ReservationActions({ reservation, now, onAction }: Props) {
  const { upcoming, ongoing } = reservationEligibility(reservation, now);
  if (!upcoming && !ongoing)
    return (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );
  return (
    <Stack direction="row" spacing={0.5}>
      {upcoming && (
        <>
          <Button size="small" startIcon={<AppIcon name="edit" />} onClick={() => onAction('edit')}>
            Edit
          </Button>
          <Button size="small" color="inherit" onClick={() => onAction('cancel')}>
            Cancel
          </Button>
        </>
      )}
      {ongoing && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AppIcon name="clock" />}
          onClick={() => onAction('complete')}
          sx={{ whiteSpace: 'nowrap' }}
        >
          End meeting
        </Button>
      )}
    </Stack>
  );
}

import { Tooltip, Typography } from '@mui/material';
import { useClock } from '@/hooks/useClock';
import { millisecondsPerMinute } from '@/utils/dates';

const formatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function LocalTime() {
  const { now } = useClock([], millisecondsPerMinute);
  return (
    <Tooltip title="Meeting times use your browser's local timezone.">
      <Typography
        component="time"
        dateTime={new Date(now).toISOString()}
        variant="caption"
        color="text.secondary"
        sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
      >
        Local time {formatter.format(now)}
      </Typography>
    </Tooltip>
  );
}

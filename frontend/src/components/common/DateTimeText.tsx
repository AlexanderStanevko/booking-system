import { Typography } from '@mui/material';
import { formatDate, formatTime } from '@/utils/dates';

export function DateTimeText({ value }: { value: string }) {
  return (
    <>
      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
        {formatDate(value)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatTime(value)}
      </Typography>
    </>
  );
}

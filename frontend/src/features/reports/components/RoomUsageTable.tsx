import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { formatNumber } from '@/utils/numbers';
import type { RoomUsage } from '../types/roomUsage';

export function RoomUsageTable({ reports }: { reports: RoomUsage[] }) {
  return (
    <Table aria-label="Room usage report">
      <TableHead>
        <TableRow>
          <TableCell>Room</TableCell>
          {[
            { label: 'Total reservations' },
            { label: 'Cancelled' },
            { label: 'Completed' },
            { label: 'Booked hours' },
            {
              label: 'Recorded usage hours',
              description: 'Time from the start until a meeting was explicitly ended early.',
            },
            {
              label: 'Estimated used hours',
              description: 'Scheduled duration of automatically completed meetings.',
            },
            {
              label: 'Recorded usage rate',
              description: 'Recorded usage hours divided by booked hours, as a percentage.',
            },
          ].map(({ label, description }) => (
            <TableCell key={label} align="right">
              {description ? (
                <Tooltip title={description} describeChild>
                  <Box
                    component="span"
                    tabIndex={0}
                    sx={{ borderBottom: '1px dotted', cursor: 'help' }}
                  >
                    {label}
                  </Box>
                </Tooltip>
              ) : (
                label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.roomId} hover>
            <TableCell>
              <Typography variant="subtitle2">{report.roomName}</Typography>
            </TableCell>
            <TableCell align="right">{report.totalReservations}</TableCell>
            <TableCell align="right">{report.cancelledReservations}</TableCell>
            <TableCell align="right">{report.completedReservations}</TableCell>
            <TableCell align="right">{formatNumber(report.totalBookedHours)}</TableCell>
            <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {formatNumber(report.recordedUsageHours)}
            </TableCell>
            <TableCell align="right">{formatNumber(report.estimatedUsedHours)}</TableCell>
            <TableCell align="right">
              <Chip
                label={`${formatNumber(report.recordedUsageRate)}%`}
                color="primary"
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import { Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { formatNumber } from '../../../utils/numbers';
import type { RoomUsage } from '../types/roomUsage';

export function RoomUsageTable({ reports }: { reports: RoomUsage[] }) {
  return (
    <Table aria-label="Room usage report">
      <TableHead>
        <TableRow>
          <TableCell>Room</TableCell>
          {[
            'Total reservations',
            'Cancelled',
            'Completed',
            'Booked hours',
            'Recorded usage hours',
            'Estimated used hours',
            'Recorded usage rate',
          ].map((heading) => (
            <TableCell key={heading} align="right">
              {heading}
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

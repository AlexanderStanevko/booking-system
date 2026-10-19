import {
  Avatar,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { equipmentNames, type Room } from '../types/room';

export function RoomTable({ rooms }: { rooms: Room[] }) {
  return (
    <Table aria-label="Meeting rooms">
      <TableHead>
        <TableRow>
          {['Room', 'Capacity', 'Floor', 'Location', 'Equipment', 'Status'].map((heading) => (
            <TableCell key={heading}>{heading}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rooms.map((room) => (
          <TableRow key={room.id} hover>
            <TableCell>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'action.selected', color: 'primary.main', fontSize: '1rem' }}
                >
                  {room.name.slice(0, 1)}
                </Avatar>
                <Typography variant="subtitle2">{room.name}</Typography>
              </Stack>
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{room.capacity} people</TableCell>
            <TableCell>{room.floor}</TableCell>
            <TableCell sx={{ minWidth: 160 }}>{room.location}</TableCell>
            <TableCell>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, minWidth: 200 }}>
                {equipmentNames(room.equipment).map((name) => (
                  <Chip key={name} label={name} variant="outlined" />
                ))}
                {room.equipment === 'None' && (
                  <Typography variant="body2" color="text.secondary">
                    None
                  </Typography>
                )}
              </Stack>
            </TableCell>
            <TableCell>
              <Chip
                label={room.isActive ? 'Active' : 'Inactive'}
                color={room.isActive ? 'success' : 'default'}
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

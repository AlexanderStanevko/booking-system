import {
  Avatar,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { User } from '../types/user';

export function UserTable({ users }: { users: User[] }) {
  return (
    <Table aria-label="Workspace users">
      <TableHead>
        <TableRow>
          {['First name', 'Last name', 'Unique identifier', 'Active reservations'].map(
            (heading) => (
              <TableCell key={heading}>{heading}</TableCell>
            ),
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} hover>
            <TableCell>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'action.hover', color: 'primary.main', fontSize: '0.8rem' }}>
                  {user.firstName.slice(0, 1)}
                  {user.lastName.slice(0, 1)}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.firstName}
                </Typography>
              </Stack>
            </TableCell>
            <TableCell>{user.lastName}</TableCell>
            <TableCell>
              <Box component="code" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                {user.id}
              </Box>
            </TableCell>
            <TableCell>
              <Chip
                label={user.activeReservationCount}
                color={user.activeReservationCount ? 'primary' : 'default'}
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

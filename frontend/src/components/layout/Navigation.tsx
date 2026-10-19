import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router';
import { AppIcon, type IconName } from '../common/AppIcon';

const navigation: { path: string; label: string; icon: IconName }[] = [
  { path: '/rooms', label: 'Rooms', icon: 'rooms' },
  { path: '/users', label: 'Users', icon: 'users' },
  { path: '/reservations', label: 'Reservations', icon: 'reservations' },
  { path: '/reports', label: 'Room usage', icon: 'reports' },
];

export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 3, py: 4 }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 1,
            borderRadius: 1,
            display: 'flex',
          }}
        >
          <AppIcon name="rooms" />
        </Box>
        <Box>
          <Typography variant="subtitle2">Meeting rooms</Typography>
          <Typography variant="caption" color="text.secondary">
            Reservation workspace
          </Typography>
        </Box>
      </Stack>
      <Divider />
      <Box component="nav" aria-label="Main navigation" sx={{ p: 2, flex: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>
          Manage workspace
        </Typography>
        <List sx={{ pt: 1.5 }}>
          {navigation.map(({ path, label, icon }) => (
            <ListItem key={path} disablePadding sx={{ mb: 0.75 }}>
              <ListItemButton
                component={NavLink}
                to={path}
                selected={pathname === path}
                onClick={onNavigate}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <AppIcon name={icon} fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          A place for focused collaboration.
        </Typography>
      </Box>
    </>
  );
}

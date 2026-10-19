import { Suspense, useState } from 'react';
import { Box, Drawer, IconButton, LinearProgress, Link, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router';
import { Navigation } from '../../components/layout/Navigation';
import { AppIcon } from '../../components/common/AppIcon';
import { layoutTokens } from '../../theme/theme';
import { localTimeZone } from '../../utils/dates';
import styles from './DashboardLayout.module.scss';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <Box
      className={styles.dashboard}
      sx={{
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'var(--sidebar-width) minmax(0, 1fr)' },
        '--page-gutter': { xs: 'var(--mobile-gutter)', md: 'var(--desktop-gutter)' },
      }}
    >
      <Link
        href="#main-content"
        className={styles['dashboard__skipLink']}
        sx={{ bgcolor: 'background.paper', zIndex: 'tooltip', borderRadius: 1 }}
      >
        Skip to content
      </Link>
      <Box
        component="aside"
        className={styles['dashboard__sidebar']}
        sx={{
          display: { xs: 'none', md: 'flex' },
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <Navigation />
      </Box>
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ paper: { sx: { width: layoutTokens.sidebarWidth } } }}
      >
        <Navigation onNavigate={() => setMobileOpen(false)} />
      </Drawer>
      <Box className={styles['dashboard__main']}>
        <Box
          component="header"
          className={styles['dashboard__header']}
          sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <AppIcon name="menu" />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Office management
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <AppIcon
              name="clock"
              sx={{
                fontSize: '1rem',
                color: 'text.secondary',
                display: { xs: 'none', sm: 'block' },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {localTimeZone.replaceAll('_', ' ')}
            </Typography>
          </Stack>
        </Box>
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          className={styles['dashboard__content']}
        >
          <Suspense fallback={<LinearProgress aria-label="Loading page" />}>
            <Outlet />
          </Suspense>
        </Box>
        <Typography
          component="footer"
          variant="caption"
          color="text.secondary"
          sx={{ px: { xs: 2.5, md: 4 }, pb: 3 }}
        >
          Meeting Room Reservation System · All meeting times are shown in your local timezone.
        </Typography>
      </Box>
    </Box>
  );
}

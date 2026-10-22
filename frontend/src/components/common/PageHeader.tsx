import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function PageHeader({ title, description, action, onRefresh, refreshing }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 4 }}
    >
      <Box>
        <Typography component="h1" variant="h4" sx={{ mb: description ? 1 : 0 }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" variant="body2">
            {description}
          </Typography>
        )}
      </Box>
      <Stack direction="row" spacing={1}>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label={`Refresh ${title.toLowerCase()}`}
          >
            Refresh
          </Button>
        )}
        {action}
      </Stack>
    </Stack>
  );
}

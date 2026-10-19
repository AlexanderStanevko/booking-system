import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface Props {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 4 }}
    >
      <Box>
        <Typography variant="overline" color="primary">
          Workspace
        </Typography>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

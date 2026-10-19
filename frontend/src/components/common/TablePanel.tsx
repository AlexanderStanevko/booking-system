import type { ReactNode } from 'react';
import { Box, Chip, LinearProgress, Paper, Stack, TableContainer, Typography } from '@mui/material';

interface Props {
  title: string;
  count: number;
  refreshing: boolean;
  children: ReactNode;
}

export function TablePanel({ title, count, refreshing, children }: Props) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 2.5, py: 2.5 }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <Chip label={count} variant="outlined" aria-label={`${count} results`} />
      </Stack>
      <Box sx={{ height: 2 }}>{refreshing && <LinearProgress sx={{ height: '100%' }} />}</Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'block', md: 'none' }, px: 2.5, pb: 1.5 }}
      >
        Scroll horizontally to view all columns.
      </Typography>
      <TableContainer component="section" tabIndex={0} aria-label={`${title} table`}>
        {children}
      </TableContainer>
    </Paper>
  );
}

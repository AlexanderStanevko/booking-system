import type { ReactNode } from 'react';
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  TableContainer,
  TablePagination,
  Typography,
  type TablePaginationProps,
} from '@mui/material';
import { paginationPageSizes } from '../../hooks/usePagination';

interface Props {
  title: string;
  count: number;
  refreshing: boolean;
  pagination: Pick<
    TablePaginationProps,
    'count' | 'page' | 'rowsPerPage' | 'onPageChange' | 'onRowsPerPageChange'
  >;
  children: ReactNode;
}

export function TablePanel({ title, count, refreshing, pagination, children }: Props) {
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
      <TablePagination
        component="div"
        {...pagination}
        rowsPerPageOptions={paginationPageSizes}
        sx={{ borderTop: 1, borderColor: 'divider' }}
        slotProps={{
          toolbar: { sx: { flexWrap: 'wrap', justifyContent: 'flex-end', px: { xs: 1, sm: 2 } } },
          spacer: { style: { flex: '1 1 0%' } },
        }}
      />
    </Paper>
  );
}

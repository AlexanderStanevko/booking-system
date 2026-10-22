import type { ReactNode } from 'react';
import { Alert, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { ApiErrorMessage } from './ApiErrorMessage';

interface Props {
  pending: boolean;
  error: unknown;
  empty?: boolean;
  emptyMessage?: string;
  onRetry: () => void;
  children: ReactNode;
}

export function QueryState({ pending, error, empty, emptyMessage, onRetry, children }: Props) {
  if (pending) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }} aria-label="Loading results" aria-busy="true">
        <Stack spacing={2}>
          <Skeleton width="35%" />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Stack>
      </Paper>
    );
  }
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        <ApiErrorMessage error={error} />
      </Alert>
    );
  }
  if (empty) {
    return (
      <Paper variant="outlined" sx={{ py: 7, px: 3, textAlign: 'center' }}>
        <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
          No results found
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {emptyMessage ?? 'Try adjusting or resetting your filters.'}
        </Typography>
      </Paper>
    );
  }
  return children;
}

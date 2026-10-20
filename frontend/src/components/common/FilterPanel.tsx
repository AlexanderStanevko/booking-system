import type { FormEvent, ReactNode } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { layoutTokens } from '../../theme/theme';
import { AppIcon } from './AppIcon';

interface Props {
  children: ReactNode;
  onApply: () => void;
  onReset: () => void;
  error?: string | null;
}

export function FilterPanel({ children, onApply, onReset, error }: Props) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply();
  }
  return (
    <Paper
      component="form"
      noValidate
      variant="outlined"
      onSubmit={handleSubmit}
      sx={{ p: 2.5, mb: 3 }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5 }}>
        <AppIcon name="filter" fontSize="small" color="action" />
        <Typography variant="subtitle2">Filters</Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: `repeat(auto-fit, minmax(${layoutTokens.filterWidth}px, 1fr))`,
          },
          gap: 2,
        }}
      >
        {children}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 2.5 }}>
        <Button color="inherit" onClick={onReset}>
          Reset filters
        </Button>
        <Button type="submit" variant="outlined">
          Apply filters
        </Button>
      </Stack>
    </Paper>
  );
}

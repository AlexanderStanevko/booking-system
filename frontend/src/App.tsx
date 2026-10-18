import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getHealth } from './api/health';

export default function App() {
  const { data, error, isFetching, isSuccess, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => getHealth(signal),
    enabled: false,
    retry: false,
  });

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h5" component="h1">
          Meeting Room Reservation System
        </Typography>
        <Button variant="contained" disabled={isFetching} onClick={() => void refetch()}>
          {isFetching ? 'Checking...' : 'Check backend connection'}
        </Button>
        {error && <Alert severity="error">{error.message}</Alert>}
        {isSuccess && (
          <Box component="output" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(data, null, 2)}
          </Box>
        )}
      </Stack>
    </Container>
  );
}

import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="overline" color="primary">
        Page not found
      </Typography>
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        This space is empty.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The page you are looking for does not exist.
      </Typography>
      <Button component={Link} to="/reservations" variant="contained">
        Go to reservations
      </Button>
    </Box>
  );
}

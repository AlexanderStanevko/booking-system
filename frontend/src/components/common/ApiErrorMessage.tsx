import { Typography } from '@mui/material';
import { ApiError, apiErrorCodes, errorMessage } from '@/api/errors';

export function ApiErrorMessage({ error }: { error: unknown }) {
  return (
    <>
      {errorMessage(error)}
      {error instanceof ApiError &&
        error.status >= 400 &&
        error.code !== apiErrorCodes.httpError && (
          <Typography component="div" variant="caption" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
            Code: <code>{error.code}</code>
          </Typography>
        )}
    </>
  );
}

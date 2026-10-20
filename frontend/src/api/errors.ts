export const apiErrorCodes = {
  networkError: 'NETWORK_ERROR',
  httpError: 'HTTP_ERROR',
  invalidResponse: 'INVALID_RESPONSE',
} as const;

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
}

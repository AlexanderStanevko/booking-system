import { z } from 'zod';
import { ApiError, apiErrorCodes } from './errors';

const errorSchema = z.object({ code: z.string(), message: z.string() });
const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<T> {
  const options: RequestInit = { method, signal };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, options);
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error;
    if (!(error instanceof TypeError)) throw error;
    throw new ApiError(
      apiErrorCodes.networkError,
      'We could not reach the server. Please try again.',
      0,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  if (!response.ok) {
    const result = errorSchema.safeParse(payload);
    if (result.success) {
      throw new ApiError(result.data.code, result.data.message, response.status);
    }
    throw new ApiError(
      apiErrorCodes.httpError,
      'The request could not be completed. Please try again.',
      response.status,
    );
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiError(
      apiErrorCodes.invalidResponse,
      'The server returned an unexpected response. Please try again.',
      response.status,
    );
  }
  return result.data;
}

export function queryString(values: Record<string, string | number | undefined>): string {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  }
  const query = parameters.toString();
  return query ? `?${query}` : '';
}

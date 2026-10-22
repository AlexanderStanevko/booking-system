import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { apiRequest } from './client';
import { ApiError, apiErrorCodes, errorMessage } from './errors';

const fetchMock = vi.fn<typeof fetch>();
const schema = z.object({ id: z.string() });

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

it('preserves backend error codes, messages, and HTTP status', async () => {
  const error = { code: 'ROOM_ALREADY_BOOKED', message: 'This room is already booked.' };
  fetchMock.mockResolvedValue(Response.json(error, { status: 409 }));
  await expect(apiRequest('/api/reservations', schema)).rejects.toMatchObject({
    ...error,
    name: 'ApiError',
    status: 409,
  });
});

it('provides a fallback for malformed or unstructured HTTP errors', async () => {
  for (const body of ['not JSON', '{"unexpected":true}']) {
    fetchMock.mockResolvedValue(new Response(body, { status: 503 }));
    await expect(apiRequest('/api/rooms', schema)).rejects.toMatchObject({
      code: apiErrorCodes.httpError,
      status: 503,
    });
  }
});

it('represents Fetch network failures separately from HTTP errors', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(apiRequest('/api/rooms', schema)).rejects.toMatchObject({
    code: apiErrorCodes.networkError,
    status: 0,
  });
});

it('preserves request cancellation and custom AbortSignal reasons', async () => {
  const aborted = new DOMException('Aborted', 'AbortError');
  fetchMock.mockRejectedValue(aborted);
  await expect(apiRequest('/api/rooms', schema)).rejects.toBe(aborted);
  const controller = new AbortController();
  const reason = new TypeError('Cancelled');
  controller.abort(reason);
  fetchMock.mockRejectedValue(reason);
  await expect(apiRequest('/api/rooms', schema, { signal: controller.signal })).rejects.toBe(
    reason,
  );
});

it('rejects malformed or schema-invalid successful responses', async () => {
  for (const body of ['not JSON', '', '{"id":123}']) {
    fetchMock.mockResolvedValue(new Response(body, { status: 200 }));
    await expect(apiRequest('/api/rooms', schema)).rejects.toMatchObject({
      code: apiErrorCodes.invalidResponse,
      status: 200,
    });
  }
});

it('preserves cancellation while reading the response body', async () => {
  const error = new DOMException('Aborted', 'AbortError');
  const response = Response.json({ id: 'room' });
  vi.spyOn(response, 'json').mockRejectedValue(error);
  fetchMock.mockResolvedValue(response);
  await expect(apiRequest('/api/rooms', schema)).rejects.toBe(error);
});

it('presents API messages and a safe fallback for other failures', () => {
  expect(errorMessage(new ApiError(apiErrorCodes.networkError, 'Try again.', 0))).toBe(
    'Try again.',
  );
  expect(errorMessage(new Error('Internal details'))).toBe(
    'Something went wrong. Please try again.',
  );
});

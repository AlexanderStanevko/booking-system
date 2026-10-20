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

it.each(['not JSON', '', '{"unexpected":true}'])(
  'falls back for an unstructured HTTP error: %j',
  async (body) => {
    fetchMock.mockResolvedValue(new Response(body, { status: 503 }));

    await expect(apiRequest('/api/rooms', schema)).rejects.toMatchObject({
      code: apiErrorCodes.httpError,
      status: 503,
    });
  },
);

it('represents Fetch network failures separately from HTTP errors', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

  await expect(apiRequest('/api/rooms', schema)).rejects.toMatchObject({
    code: apiErrorCodes.networkError,
    status: 0,
  });
});

it('preserves an aborted Fetch request unchanged', async () => {
  const error = new DOMException('Aborted', 'AbortError');
  fetchMock.mockRejectedValue(error);

  await expect(apiRequest('/api/rooms', schema)).rejects.toBe(error);
});

it('preserves a custom AbortSignal reason', async () => {
  const controller = new AbortController();
  const reason = new TypeError('Cancelled');
  controller.abort(reason);
  fetchMock.mockRejectedValue(reason);

  await expect(apiRequest('/api/rooms', schema, { signal: controller.signal })).rejects.toBe(
    reason,
  );
});

it.each(['not JSON', '', '{"id":123}'])(
  'rejects an invalid successful response: %j',
  async (body) => {
    fetchMock.mockResolvedValue(new Response(body, { status: 200 }));

    await expect(apiRequest('/api/rooms', schema)).rejects.toMatchObject({
      code: apiErrorCodes.invalidResponse,
      status: 200,
    });
  },
);

it('rejects an empty response when the schema requires data', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

  await expect(apiRequest('/api/rooms', schema)).rejects.toMatchObject({
    code: apiErrorCodes.invalidResponse,
    status: 204,
  });
});

it.each([new DOMException('Aborted', 'AbortError'), new TypeError('Body read failed')])(
  'preserves response-reading failures: %s',
  async (error) => {
    const response = Response.json({ id: 'room' });
    vi.spyOn(response, 'json').mockRejectedValue(error);
    fetchMock.mockResolvedValue(response);

    await expect(apiRequest('/api/rooms', schema)).rejects.toBe(error);
  },
);

it('does not mislabel request-serialization errors as network failures', async () => {
  const error = new TypeError('Cannot serialize');
  const body = {
    toJSON() {
      throw error;
    },
  };

  await expect(apiRequest('/api/reservations', schema, { method: 'POST', body })).rejects.toBe(
    error,
  );
  expect(fetchMock).not.toHaveBeenCalled();
});

it('does not hide unexpected Fetch errors', async () => {
  const error = new ReferenceError('Unexpected failure');
  fetchMock.mockRejectedValue(error);

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

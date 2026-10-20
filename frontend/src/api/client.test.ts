import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { apiRequest, queryString } from './client';

const fetchMock = vi.fn<typeof fetch>();
const schema = z.object({ id: z.string() });
const payload = { id: 'reservation' };

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

it('sends a GET request with its AbortSignal and returns validated data', async () => {
  fetchMock.mockResolvedValue(Response.json(payload));
  const controller = new AbortController();

  await expect(
    apiRequest('/api/reservations/1', schema, { signal: controller.signal }),
  ).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith('http://localhost:5000/api/reservations/1', {
    method: 'GET',
    signal: controller.signal,
  });
});

it.each(['POST', 'PUT'] as const)('sends a %s request with a JSON body', async (method) => {
  fetchMock.mockResolvedValue(Response.json(payload));
  const body = { title: 'Planning', attendeeCount: 4 };

  await expect(apiRequest('/api/reservations', schema, { method, body })).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith('http://localhost:5000/api/reservations', {
    method,
    signal: undefined,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
});

it('allows a POST without a body or a content-type header', async () => {
  fetchMock.mockResolvedValue(Response.json(payload));

  await apiRequest('/api/reservations/1/cancel', schema, { method: 'POST' });

  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
    'http://localhost:5000/api/reservations/1/cancel',
    { method: 'POST', signal: undefined },
  );
});

it('returns the schema output rather than the unchecked response', async () => {
  fetchMock.mockResolvedValue(Response.json({ id: 'reservation', ignored: true }));

  await expect(apiRequest('/api/reservations/1', schema)).resolves.toEqual(payload);
});

it('accepts an empty response when the response schema allows it', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

  await expect(apiRequest('/api/example', z.undefined())).resolves.toBeUndefined();
});

it('serializes encoded parameters and zero while omitting undefined and empty strings', () => {
  expect(
    queryString({
      query: 'A & B',
      equipment: 'Projector, Whiteboard',
      floor: 0,
      absent: undefined,
      empty: '',
    }),
  ).toBe('?query=A+%26+B&equipment=Projector%2C+Whiteboard&floor=0');
});

it.each([{}, { missing: undefined, empty: '' }])(
  'returns no query suffix for empty parameters',
  (values) => {
    expect(queryString(values)).toBe('');
  },
);

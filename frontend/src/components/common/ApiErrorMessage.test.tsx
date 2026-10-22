import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';
import { ApiError, apiErrorCodes } from '@/api/errors';
import { renderHook } from '@/test/renderHook';
import { QueryState } from './QueryState';

it('shows the backend message and code in one alert while preserving retry', async () => {
  const retry = vi.fn();
  const error = new ApiError('ROOM_ALREADY_BOOKED', 'This room is already booked.', 409);
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryState pending={false} error={error} onRetry={retry}>
        {children}
      </QueryState>
    );
  }
  await renderHook(() => null, Wrapper);
  const alerts = document.querySelectorAll('[role="alert"]');
  expect(alerts).toHaveLength(1);
  const alert = alerts[0]!;
  expect(alert.textContent).toContain(error.message);
  expect(alert.textContent).toContain('Code: ROOM_ALREADY_BOOKED');
  expect(alert.textContent).not.toContain(error.stack);
  alert.querySelector<HTMLButtonElement>('button')!.click();
  expect(retry).toHaveBeenCalledOnce();
});

it('keeps client failure messages and safe unknown-error fallbacks unchanged', async () => {
  let error: unknown;
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryState pending={false} error={error} onRetry={() => undefined}>
        {children}
      </QueryState>
    );
  }
  const view = await renderHook(() => null, Wrapper);
  for (const [failure, message] of [
    [new ApiError(apiErrorCodes.networkError, 'Try again.', 0), 'Try again.'],
    [new ApiError(apiErrorCodes.httpError, 'Request failed.', 503), 'Request failed.'],
    [
      new ApiError(apiErrorCodes.invalidResponse, 'Unexpected response.', 200),
      'Unexpected response.',
    ],
    [new Error('Internal details'), 'Something went wrong. Please try again.'],
  ] as const) {
    error = failure;
    await view.rerender();
    const alert = document.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain(message);
    expect(alert.textContent).not.toContain('Code:');
    expect(alert.textContent).not.toContain('Internal details');
  }
});

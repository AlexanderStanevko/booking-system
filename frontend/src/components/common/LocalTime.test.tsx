import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { renderHook } from '@/test/renderHook';
import { LocalTime } from './LocalTime';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <LocalTime />
      {children}
    </>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-15T08:00:30Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

it('shows browser-local hours and minutes and updates with one cleaned-up timer', async () => {
  const view = await renderHook(() => null, Wrapper);
  expect(document.querySelector('time')?.textContent).toBe('Local time 10:00');
  expect(vi.getTimerCount()).toBe(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30001);
  });
  expect(document.querySelector('time')?.textContent).toBe('Local time 10:01');
  expect(vi.getTimerCount()).toBe(1);
  vi.setSystemTime(new Date('2026-01-15T22:07:00Z'));
  await act(async () => window.dispatchEvent(new Event('focus')));
  expect(document.querySelector('time')?.textContent).toBe('Local time 00:07');
  await view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

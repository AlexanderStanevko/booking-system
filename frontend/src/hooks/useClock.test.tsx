import { act } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { renderHook } from '../test/renderHook';
import { useClock } from './useClock';

const initialTime = Date.parse('2026-01-15T08:00:00Z');
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(initialTime);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('uses one timer for multiple boundaries and stops after the last', async () => {
  const view = await renderHook(() => useClock([initialTime + 1000, initialTime + 2000]));
  expect(vi.getTimerCount()).toBe(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1001);
  });
  expect(view.current.now).toBe(initialTime + 1001);
  expect(vi.getTimerCount()).toBe(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(view.current.now).toBe(initialTime + 2001);
  expect(vi.getTimerCount()).toBe(0);
});

it('cleans up its timer and both recovery listeners', async () => {
  const removeWindow = vi.spyOn(window, 'removeEventListener');
  const removeDocument = vi.spyOn(document, 'removeEventListener');
  const view = await renderHook(() => useClock([initialTime + 1000]));
  await view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(removeWindow).toHaveBeenCalledWith('focus', expect.any(Function));
  expect(removeDocument).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
});

it('pauses hidden-tab updates and catches up when the tab becomes visible', async () => {
  const visibility = vi.spyOn(document, 'visibilityState', 'get');
  const view = await renderHook(() => useClock([initialTime + 1000]));
  visibility.mockReturnValue('hidden');
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(view.current.now).toBe(initialTime);
  expect(vi.getTimerCount()).toBe(0);
  visibility.mockReturnValue('visible');
  await act(async () => document.dispatchEvent(new Event('visibilitychange')));
  expect(view.current.now).toBe(initialTime + 5000);
  expect(vi.getTimerCount()).toBe(0);
});

it('recovers from a backward system-clock change on focus without immediate loops', async () => {
  const view = await renderHook(() => useClock([initialTime + 1000]));
  vi.setSystemTime(initialTime - 10000);
  await act(async () => window.dispatchEvent(new Event('focus')));
  expect(view.current.now).toBe(initialTime - 10000);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(11001);
  });
  expect(view.current.now).toBe(initialTime + 1001);
  expect(vi.getTimerCount()).toBe(0);
});

it('safely schedules a boundary beyond the maximum JavaScript timeout', async () => {
  const delay = 30 * 24 * 60 * 60 * 1000;
  const view = await renderHook(() => useClock([initialTime + delay]));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2_147_483_647);
  });
  expect(view.current.now).toBe(initialTime + 2_147_483_647);
  expect(vi.getTimerCount()).toBe(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(delay - 2_147_483_647 + 1);
  });
  expect(view.current.now).toBe(initialTime + delay + 1);
  expect(vi.getTimerCount()).toBe(0);
});

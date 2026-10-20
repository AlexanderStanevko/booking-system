import { useCallback, useEffect, useState } from 'react';

const maximumTimeoutMilliseconds = 2_147_483_647;

export function useClock(boundaries: readonly number[], intervalMilliseconds?: number) {
  const [now, setNow] = useState(Date.now);
  const nextTick = intervalMilliseconds
    ? (Math.floor(now / intervalMilliseconds) + 1) * intervalMilliseconds
    : Infinity;
  const nextBoundary = Math.min(nextTick, ...boundaries.filter((boundary) => boundary > now));
  const refresh = useCallback(() => {
    if (document.visibilityState !== 'hidden') setNow(Date.now());
  }, []);
  useEffect(() => {
    if (!Number.isFinite(nextBoundary)) return;
    const delay = Math.min(Math.max(nextBoundary - Date.now() + 1, 1), maximumTimeoutMilliseconds);
    const timer = window.setTimeout(refresh, delay);
    return () => window.clearTimeout(timer);
  }, [nextBoundary, now, refresh]);
  useEffect(() => {
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refresh]);
  return { now, refresh };
}

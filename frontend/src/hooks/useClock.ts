import { useEffect, useState } from 'react';

const clockTickMilliseconds = 1000;

export function useClock(): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), clockTickMilliseconds);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

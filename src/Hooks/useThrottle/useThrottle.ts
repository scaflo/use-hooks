import { useEffect, useRef, useState } from "react";

export function useThrottle<T>(value: T, limit = 200) {
  const [throttled, setThrottled] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const now = Date.now();
    if (now - lastRan.current >= limit) {
      setThrottled(value);
      lastRan.current = now;
    } else {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(
        () => {
          setThrottled(value);
          lastRan.current = Date.now();
        },
        limit - (now - lastRan.current)
      );
    }
    return () => window.clearTimeout(timer.current);
  }, [value, limit]);

  return throttled;
}

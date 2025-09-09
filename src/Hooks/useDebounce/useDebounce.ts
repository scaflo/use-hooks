import { useCallback, useEffect, useRef, useState } from "react";

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState<T>(value);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDebounced(value), delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [value, delay]);

  const cancel = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = undefined;
    }
  }, []);

  return { value: debounced, cancel } as const;
}

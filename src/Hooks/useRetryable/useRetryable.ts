import { useCallback, useRef, useState } from "react";

type RetryableOptions = {
  retries?: number; // number of retries (default 3)
  delay?: number; // ms delay between retries (default 1000)
};

/**
 * useRetryable - retry a promise-returning function with configurable retries and delay
 */
export function useRetryable<T>(
  fn: () => Promise<T>,
  options?: RetryableOptions
) {
  const { retries = 3, delay = 1000 } = options ?? {};
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<unknown>();

  const run = useCallback(async (): Promise<T> => {
    let lastError: unknown;
    for (let i = 0; i <= retries; i++) {
      setAttempts(i + 1);
      try {
        const result = await fn();
        setError(undefined);
        return result;
      } catch (err) {
        lastError = err;
        setError(err);
        if (i < retries && delay > 0) {
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    return Promise.reject(lastError);
  }, [fn, retries, delay]);

  return { run, attempts, error } as const;
}

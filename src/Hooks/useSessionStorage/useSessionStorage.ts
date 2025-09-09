import { safeParse } from "$/Hooks/common/hooks/hooks.js";
import { useCallback, useEffect, useState } from "react";


export function useSessionStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.sessionStorage.getItem(key);
      return safeParse<T>(raw, initialValue);
    } catch {
      return initialValue;
    }
  });

  const set = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          window.sessionStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    setState(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      setState((prev) => safeParse<T>(e.newValue, prev));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [state, set, remove] as const;
}

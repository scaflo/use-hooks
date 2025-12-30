import { useCallback, useEffect, useRef, useState } from "react";

type UseIdleOptions = {
  timeout?: number; // ms until considered idle
  initialState?: boolean;
  events?: string[];
};

const DEFAULT_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
];

export function useIdle({
  timeout = 60_000,
  initialState = false,
  events = DEFAULT_EVENTS,
}: UseIdleOptions = {}) {
  const [idle, setIdle] = useState<boolean>(initialState);
  const lastActiveRef = useRef<number>(Date.now());
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const markActive = useCallback(() => {
    lastActiveRef.current = Date.now();
    if (idle) setIdle(false);
    clearTimer();
    timeoutRef.current = window.setTimeout(() => {
      setIdle(true);
    }, timeout);
  }, [clearTimer, idle, timeout]);

  const reset = useCallback(() => {
    clearTimer();
    setIdle(false);
    lastActiveRef.current = Date.now();
    timeoutRef.current = window.setTimeout(() => setIdle(true), timeout);
  }, [clearTimer, timeout]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // visibilitychange should count as activity (user returned)
    const wrapped = (e: Event) => {
      // If visibility becomes visible, consider active.
      if (
        e.type === "visibilitychange" &&
        document.visibilityState === "visible"
      ) {
        markActive();
        return;
      }
      markActive();
    };

    events.forEach((ev) =>
      window.addEventListener(ev, wrapped, { passive: true }),
    );
    document.addEventListener("visibilitychange", wrapped, { passive: true });

    // start timer
    timeoutRef.current = window.setTimeout(() => setIdle(true), timeout);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, wrapped));
      document.removeEventListener("visibilitychange", wrapped);
      clearTimer();
    };
  }, [events, markActive, clearTimer, timeout]);

  return {
    idle,
    lastActive: () => lastActiveRef.current,
    reset,
  } as const;
}

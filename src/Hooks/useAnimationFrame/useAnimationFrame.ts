import { useCallback, useEffect, useRef } from "react";

export function useAnimationFrame(
  callback: (timestamp: number) => void,
  { autoStart = true }: { autoStart?: boolean } = {}
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const rafRef = useRef<number | null>(null);
  const runningRef = useRef<boolean>(autoStart);

  const loop = useCallback((t: number) => {
    cbRef.current(t);
    if (runningRef.current) {
      rafRef.current = window.requestAnimationFrame(loop);
    } else {
      rafRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    if (rafRef.current == null)
      rafRef.current = window.requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      if (rafRef.current == null)
        rafRef.current = window.requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      runningRef.current = false;
    };
    // autoStart intended only for initial mount; callback updates via ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { start, stop, isRunning: () => runningRef.current } as const;
}

import { RefObject, useEffect, useRef, useState } from "react";

type ScrollPosition = { x: number; y: number };

/**
 * Tracks scroll position for window or a provided element ref.
 * Uses requestAnimationFrame to throttle updates.
 */
export function useScrollPosition(target?: RefObject<HTMLElement> | null) {
  const [pos, setPos] = useState<ScrollPosition>({ x: 0, y: 0 });
  const ticking = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const resolve = () => {
      if (!target || !target.current) {
        return {
          x: window.scrollX || window.pageXOffset,
          y: window.scrollY || window.pageYOffset,
        };
      }
      const el = target.current;
      return { x: el.scrollLeft, y: el.scrollTop };
    };

    const handle = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        setPos(resolve());
        ticking.current = false;
      });
    };

    const attachTo = target && target.current ? target.current : window;
    attachTo.addEventListener("scroll", handle, { passive: true });
    // also listen resize for pages where layout changes affect scroll
    window.addEventListener("resize", handle, { passive: true });

    // initial read
    setPos(resolve());

    return () => {
      attachTo.removeEventListener("scroll", handle);
      window.removeEventListener("resize", handle);
    };
    // intentionally not including target.current in deps (ref identity stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return pos;
}

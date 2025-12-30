import { RefObject, useEffect, useRef } from "react";

type PossibleEventTarget = EventTarget | null | RefObject<EventTarget>;

export function useEventListener<K extends keyof GlobalEventHandlersEventMap>(
  eventName: K,
  handler: (ev: GlobalEventHandlersEventMap[K]) => void,
  target: PossibleEventTarget = window,
  options?: boolean | AddEventListenerOptions,
) {
  const savedHandler = useRef(handler);
  savedHandler.current = handler;

  useEffect(() => {
    const resolveTarget = (): EventTarget | null => {
      if (!target) return null;
      if (typeof (target as RefObject<EventTarget>)?.current !== "undefined") {
        return (target as RefObject<EventTarget>).current ?? null;
      }
      return target as EventTarget;
    };

    const t = resolveTarget();
    if (!t || !("addEventListener" in t)) return;

    const listener = (e: Event) =>
      savedHandler.current(e as GlobalEventHandlersEventMap[K]);
    t.addEventListener(eventName as string, listener as EventListener, options);
    return () =>
      t.removeEventListener(
        eventName as string,
        listener as EventListener,
        options,
      );
  }, [eventName, target, options]);
}

import { useEffect, useRef } from "react";

type BroadcastMessageHandler<T = unknown> = (message: T) => void;

type UseBroadcastChannelOptions = {
  onMessage?: BroadcastMessageHandler;
};

export function useBroadcastChannel<T = unknown>(
  name: string,
  options?: UseBroadcastChannelOptions
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const handlerRef = useRef<BroadcastMessageHandler<T> | undefined>(
    options?.onMessage
  );

  handlerRef.current = options?.onMessage;

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window))
      return;

    const channel = new BroadcastChannel(name);
    channelRef.current = channel;

    const listener = (ev: MessageEvent) => {
      handlerRef.current?.(ev.data);
    };
    channel.addEventListener("message", listener);

    return () => {
      channel.removeEventListener("message", listener);
      channel.close();
      channelRef.current = null;
    };
  }, [name]);

  const post = (message: T) => {
    channelRef.current?.postMessage(message);
  };

  return { post } as const;
}

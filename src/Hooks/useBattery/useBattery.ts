import { useEffect, useState } from "react";

export type BatteryState = {
  charging: boolean;
  level: number; // 0..1
  chargingTime: number; // seconds
  dischargingTime: number; // seconds
};

/**
 * Minimal, TS-friendly shape of the browser BatteryManager.
 * We include add/removeEventListener signatures used below.
 */
type BatteryManagerLike = EventTarget & {
  charging: boolean;
  level: number;
  chargingTime: number;
  dischargingTime: number;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
  ): void;
};

/**
 * Module augmentation so we can call navigator.getBattery() without using `any`.
 * Some TS lib configurations don't include BatteryManager; this safely declares it.
 */
declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManagerLike>;
  }
}

export function useBattery() {
  const [supported, setSupported] = useState<boolean>(
    () =>
      typeof navigator !== "undefined" &&
      typeof navigator.getBattery === "function",
  );
  const [battery, setBattery] = useState<BatteryState | null>(null);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.getBattery !== "function"
    ) {
      setSupported(false);
      return;
    }
    let mounted = true;
    let bm: BatteryManagerLike | null = null;

    const handleUpdate = () => {
      if (!bm || !mounted) return;
      setBattery({
        charging: bm.charging,
        level: bm.level,
        chargingTime: bm.chargingTime,
        dischargingTime: bm.dischargingTime,
      });
    };

    navigator.getBattery!()
      .then((batteryManager) => {
        bm = batteryManager;
        if (!mounted) return;
        setSupported(true);
        handleUpdate();
        bm.addEventListener("chargingchange", handleUpdate);
        bm.addEventListener("levelchange", handleUpdate);
        bm.addEventListener("chargingtimechange", handleUpdate);
        bm.addEventListener("dischargingtimechange", handleUpdate);
      })
      .catch(() => {
        if (mounted) setSupported(false);
      });

    return () => {
      mounted = false;
      if (bm) {
        bm.removeEventListener("chargingchange", handleUpdate);
        bm.removeEventListener("levelchange", handleUpdate);
        bm.removeEventListener("chargingtimechange", handleUpdate);
        bm.removeEventListener("dischargingtimechange", handleUpdate);
        bm = null;
      }
    };
  }, []);

  return { supported, battery } as const;
}

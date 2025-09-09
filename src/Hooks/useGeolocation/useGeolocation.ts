import { useCallback, useEffect, useRef, useState } from "react";

export type GeolocationCoords = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
};

export function useGeolocation(options?: PositionOptions) {
  const [coords, setCoords] = useState<GeolocationCoords | undefined>(
    undefined
  );
  const [error, setError] = useState<GeolocationPositionError | undefined>(
    undefined
  );
  const watchId = useRef<number | null>(null);

  const isSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  const updateFromPosition = (pos: GeolocationPosition) => {
    setCoords({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      altitudeAccuracy: pos.coords.altitudeAccuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
    });
  };

  const getCurrentPosition = useCallback(
    async (opts?: PositionOptions): Promise<GeolocationCoords> => {
      if (!isSupported)
        return Promise.reject(new Error("Geolocation is not supported"));
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const c = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude,
              altitudeAccuracy: pos.coords.altitudeAccuracy,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
            };
            setCoords(c);
            resolve(c);
          },
          (err) => {
            setError(err);
            reject(err);
          },
          opts ?? options
        );
      });
    },
    [isSupported, options]
  );

  const startWatch = useCallback(
    (opts?: PositionOptions) => {
      if (!isSupported) return;
      if (watchId.current !== null) return;
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => updateFromPosition(pos),
        (err) => setError(err),
        opts ?? options
      );
    },
    [isSupported, options]
  );

  const stopWatch = useCallback(() => {
    if (!isSupported) return;
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, [isSupported]);

  useEffect(() => () => stopWatch(), [stopWatch]);

  return {
    isSupported,
    coords,
    error,
    getCurrentPosition,
    startWatch,
    stopWatch,
  } as const;
}

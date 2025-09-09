import { GeolocationCoords, useGeolocation } from "$/Hooks/useGeolocation/useGeolocation.js";
import { useCallback, useEffect, useState } from "react";


export function useLocationData<R = unknown>(opts?: {
  reverseGeocode?: (coords: GeolocationCoords) => Promise<R>;
  geolocationOptions?: PositionOptions;
}) {
  const {
    isSupported,
    coords,
    error: geoError,
    getCurrentPosition,
  } = useGeolocation(opts?.geolocationOptions);
  const [locationData, setLocationData] = useState<R | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (!isSupported) return;
    setLoading(true);
    setError(undefined);
    try {
      const c = await getCurrentPosition(opts?.geolocationOptions);
      if (opts?.reverseGeocode && c) {
        const result = await opts.reverseGeocode(c);
        setLocationData(result);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getCurrentPosition, isSupported, opts]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!opts?.reverseGeocode) return;
      if (!coords) return;
      try {
        const r = await opts.reverseGeocode(coords);
        if (mounted) setLocationData(r);
      } catch (err) {
        if (mounted) setError(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [coords, opts]);

  return {
    isSupported,
    coords,
    locationData,
    loading,
    error: error ?? geoError,
    refresh,
  } as const;
}

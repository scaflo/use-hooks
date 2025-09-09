import { useCallback, useState } from "react";

type CookieOptions = {
  /** number treated as days from now; or provide a Date */
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
};

function serializeCookieValue<T>(v: T): string {
  if (typeof v === "string") return v as unknown as string;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function tryParseValue<T>(raw: string | null): T | string | null {
  if (raw === null) return null;
  try {
    // try JSON parse; if fails, return raw string
    return JSON.parse(raw) as T;
  } catch {
    return raw;
  }
}

function buildCookieString(name: string, value: string, opts?: CookieOptions) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  if (opts?.expires !== undefined) {
    let expiresStr: string;
    if (typeof opts.expires === "number") {
      const d = new Date();
      d.setTime(d.getTime() + opts.expires * 24 * 60 * 60 * 1000);
      expiresStr = d.toUTCString();
    } else {
      expiresStr = opts.expires.toUTCString();
    }
    parts.push(`Expires=${expiresStr}`);
  }
  parts.push(`Path=${opts?.path ?? "/"}`);
  if (opts?.domain) parts.push(`Domain=${opts.domain}`);
  if (opts?.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts?.secure) parts.push("Secure");
  return parts.join("; ");
}

function getCookieRaw(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const c of cookies) {
    const [k, ...v] = c.split("=");
    if (decodeURIComponent(k) === name) {
      return decodeURIComponent(v.join("="));
    }
  }
  return null;
}

/**
 * useCookie - read/write a cookie (generic T for structured values)
 * returns [value, setValue, remove]
 */
export function useCookie<T = string>(
  name: string,
  initialValue?: T,
  options?: CookieOptions
) {
  const read = (): T | null | string => {
    const raw = getCookieRaw(name);
    const parsed = tryParseValue<T>(raw);
    if (parsed === null && initialValue !== undefined) return initialValue;
    return parsed;
  };

  const [value, setValueState] = useState<T | string | null>(() => read());

  const setCookie = useCallback(
    (
      next: T | string | ((prev: T | string | null) => T | string),
      opts?: CookieOptions
    ) => {
      if (typeof document === "undefined") return;
      const current = (
        typeof next === "function" ? (next as any)(value) : next
      ) as T | string;
      const serialized = serializeCookieValue(current);
      const cookieStr = buildCookieString(name, serialized, {
        ...options,
        ...opts,
      });
      document.cookie = cookieStr;
      setValueState(tryParseValue<T>(serialized));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, JSON.stringify(options), value]
  );

  const remove = useCallback(() => {
    if (typeof document === "undefined") return;
    // set expires in the past
    document.cookie = buildCookieString(name, "", {
      ...options,
      expires: new Date(0),
    });
    setValueState(initialValue ?? null);
  }, [name, JSON.stringify(options), initialValue]);

  return [value as T | string | null, setCookie, remove] as const;
}

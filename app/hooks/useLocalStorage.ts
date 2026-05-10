'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

function readLocalStorageValue<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  const item = window.localStorage.getItem(key);
  if (item === null) return null;

  try {
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const hasLoadedStoredValue = useRef(false);

  useEffect(() => {
    hasLoadedStoredValue.current = false;

    const timeoutId = window.setTimeout(() => {
      const storedValue = readLocalStorageValue<T>(key);
      hasLoadedStoredValue.current = true;

      if (storedValue !== null) {
        setValue(storedValue);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [key]);

  useEffect(() => {
    if (!hasLoadedStoredValue.current) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

function readLocalStorageValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue;

  const item = window.localStorage.getItem(key);
  return item === null ? initialValue : (JSON.parse(item) as T);
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readLocalStorageValue(key, initialValue));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const addSearchParams = useCallback(
    (params: Record<string, string>) => {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(params)) {
            next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const removeSearchParams = useCallback(
    (keys: string[] | string) => {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          const keyList = Array.isArray(keys) ? keys : [keys];
          for (const key of keyList) {
            next.delete(key);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { searchParams, addSearchParams, removeSearchParams };
}

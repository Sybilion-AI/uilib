import { useCallback } from 'react';

import debounce from '@/tools/debounce';

export function useDebounceCallback<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
  deps: unknown[],
  debounceOptions?: { leading?: boolean },
) {
  const leading = debounceOptions?.leading;
  return useCallback(debounce(fn ?? (() => {}), delay, debounceOptions), [
    ...deps,
    fn,
    delay,
    leading,
  ]);
}

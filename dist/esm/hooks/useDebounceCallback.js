import { useCallback } from 'react';
import debounce from '../tools/debounce.js';

function useDebounceCallback(fn, delay, deps, debounceOptions) {
    const leading = debounceOptions?.leading;
    return useCallback(debounce(fn ?? (() => { }), delay, debounceOptions), [
        ...deps,
        fn,
        delay,
        leading,
    ]);
}

export { useDebounceCallback };

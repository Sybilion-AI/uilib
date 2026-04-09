import { useRef, useEffect, useCallback } from 'react';

function useThrottledCallback(cb, limit, options = { trailing: false }, deps = []) {
    const lastRun = useRef(0);
    const timeoutId = useRef(null);
    useEffect(() => {
        return () => {
            clearTimeout(timeoutId.current);
        };
    }, deps);
    return useCallback((...args) => {
        const now = Date.now();
        const execute = () => {
            cb(...args);
            lastRun.current = now;
        };
        const remaining = limit - (now - lastRun.current);
        if (remaining <= 0) {
            clearTimeout(timeoutId.current);
            execute();
        }
        else if (options.trailing && !timeoutId.current) {
            timeoutId.current = setTimeout(execute, remaining);
        }
    }, [limit, options.trailing, ...deps]);
}

export { useThrottledCallback };

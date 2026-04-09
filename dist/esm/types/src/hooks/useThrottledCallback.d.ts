type ThrottleOptions = {
    trailing?: boolean;
};
export declare function useThrottledCallback<T extends any[]>(cb: (...args: T) => void, limit: number, options?: ThrottleOptions, deps?: any[]): (...args: T) => void;
export {};

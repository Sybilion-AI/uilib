export declare function useDebounceCallback<T extends (...args: unknown[]) => void>(fn: T, delay: number, deps: unknown[], debounceOptions?: {
    leading?: boolean;
}): import("#uilib/tools/debounce").Debounced<T | (() => void)>;

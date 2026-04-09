export type Debounced<T extends (...args: unknown[]) => void> = ((this: ThisParameterType<T>, ...args: Parameters<T>) => void) & {
    cancel: () => void;
};
export default function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number, options?: {
    leading?: boolean;
}): Debounced<T>;

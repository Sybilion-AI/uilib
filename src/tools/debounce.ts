export type Debounced<T extends (...args: unknown[]) => void> = ((
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => void) & { cancel: () => void };

export default function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
  options?: { leading?: boolean },
): Debounced<T> {
  const leading = options?.leading ?? true;

  if (!leading) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    function debouncedTrailing(
      this: ThisParameterType<T>,
      ...args: Parameters<T>
    ) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
        timeoutId = undefined;
      }, ms);
    }
    debouncedTrailing.cancel = () => {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    };
    return debouncedTrailing;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let needCall = true;

  function debouncedLeading(
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    const call = () => fn.apply(this, args);

    clearTimeout(timeoutId);

    if (needCall) {
      call();
      needCall = false;
    }

    timeoutId = setTimeout(() => {
      if (needCall) call();
      needCall = true;
    }, ms);
  }
  debouncedLeading.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
    needCall = true;
  };
  return debouncedLeading;
}

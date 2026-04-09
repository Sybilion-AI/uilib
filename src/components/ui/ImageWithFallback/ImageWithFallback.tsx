import { type ReactNode, useEffect, useState } from 'react';

import { ImageBrokenIcon } from '@phosphor-icons/react';

import type { ImageWithFallbackProps } from './ImageWithFallback.types';

export function ImageWithFallback({
  url,
  fallback,
  className,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!url?.trim());
  }, [url]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(e);
  };

  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <img src={url} className={className} onError={handleError} {...props} />
  );
}

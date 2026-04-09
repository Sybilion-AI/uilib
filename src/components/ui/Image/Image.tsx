'use client';

import { useEffect, useState } from 'react';

import cn from 'classnames';

import S from './Image.styl';
import type { ImageProps } from './Image.types';

function Image({ url, fallback, className, ...props }: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={S.container}>
      {isLoading && <div className={S.fallback}>{fallback}</div>}
      <img
        src={url}
        className={cn(S.image, isLoading && S.loading, className)}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
}

export { Image };

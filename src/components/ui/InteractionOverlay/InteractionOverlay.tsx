'use client';

import cn from 'classnames';
import { useCallback, useEffect, useState } from 'react';

import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';

import S from './InteractionOverlay.styl';

interface InteractionOverlayProps {
  className?: string;
  children?: React.ReactNode;
}

export function InteractionOverlay({
  className,
  children,
}: InteractionOverlayProps) {
  const isTouchDevice = useIsTouchDevice();
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (isTouchDevice) {
      setIsVisible(true);
    }
  }, [isTouchDevice]);

  useEffect(() => {
    if (!isTouchDevice) return;

    const handleScroll = () => {
      setIsVisible(true);
    };

    document.addEventListener('scroll', handleScroll, { capture: true });
    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isTouchDevice]);

  if (!isTouchDevice) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(S.root, !isVisible && S.hidden, className)}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

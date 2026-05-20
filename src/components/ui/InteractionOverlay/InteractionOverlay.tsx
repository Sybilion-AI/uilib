import cn from 'classnames';
import { useCallback, useEffect, useState } from 'react';

import { useIsChatLoading } from '#uilib/contexts/chat-context';
import { useIsTouchDevice } from '#uilib/hooks/useIsTouchDevice';

import S from './InteractionOverlay.styl';

interface InteractionOverlayProps {
  className?: string;
  children?: React.ReactNode;
  message?: string;
  /** When true, hides the touch overlay (e.g. chart data loading). */
  disabled?: boolean;
}

export function InteractionOverlay({
  className,
  children,
  message = 'Touch to interact',
  disabled = false,
}: InteractionOverlayProps) {
  const isTouchDevice = useIsTouchDevice();
  const isChatLoading = useIsChatLoading();
  const suppressOverlay = disabled || isChatLoading;
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (isTouchDevice && !suppressOverlay) {
      setIsVisible(true);
    }
  }, [isTouchDevice, suppressOverlay]);

  useEffect(() => {
    if (!isTouchDevice || suppressOverlay) return;

    const handleScroll = () => {
      setIsVisible(true);
    };

    document.addEventListener('scroll', handleScroll, { capture: true });
    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isTouchDevice, suppressOverlay]);

  if (!isTouchDevice) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        S.root,
        (!isVisible || suppressOverlay) && S.hidden,
        className,
      )}
    >
      {children}
      <button
        type="button"
        className={S.overlay}
        onClick={handleClick}
        aria-label={message}
      >
        <span className={S.message}>{message}</span>
      </button>
    </div>
  );
}

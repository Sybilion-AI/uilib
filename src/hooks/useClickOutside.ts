import { RefObject } from 'react';

import useEvent from '@/hooks/useEvent';

type Options = {
  elem: RefObject<HTMLElement>;
  isCapture?: boolean;
  isPassive?: boolean;
  isActive?: boolean;
  callback: (e: MouseEvent) => void;
};

export default function useClickOutside({
  elem,
  callback,
  isActive = true,
  isCapture = false,
  isPassive = false,
}: Options) {
  const handleClick = (e: MouseEvent) => {
    if (
      !elem.current?.contains(e.target as Node) &&
      document.body.contains(e.target as Node)
    ) {
      callback(e);
    }
  };

  useEvent({
    elem,
    event: 'click',
    callback: handleClick,
    isActive,
    isCapture,
  });
}

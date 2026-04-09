import { useEffect } from 'react';

import useEvent from '#uilib/hooks/useEvent';

export function AltKeyProvider({ isDebug }: { isDebug: boolean }) {
  useEvent({
    isActive: isDebug,
    event: ['keydown'],
    callback: (e: Event) => {
      if (!(e instanceof KeyboardEvent) || e.key !== 'Alt') return;
      document.body.classList.toggle('alt');
    },
  });

  useEffect(() => {
    if (!isDebug) {
      document.body.classList.remove('alt');
    }
  }, [isDebug]);

  return null;
}

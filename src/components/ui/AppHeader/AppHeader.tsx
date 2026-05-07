import cn from 'classnames';
import { ReactNode, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import S from './AppHeader.styl';
import { PAGE_HEADER_ID } from './appChromeAnchors';

export type AppHeaderProps = {
  className?: string;
  /** Override default anchor id when multiple headers exist (e.g. docs demos). */
  anchorId?: string;
};

export function AppHeaderHost({
  className,
  anchorId = PAGE_HEADER_ID,
}: AppHeaderProps) {
  return <header className={cn(S.root, className)} id={anchorId} />;
}

export type AppHeaderPortalProps = {
  children: ReactNode;
};

export function AppHeaderPortal({ children }: AppHeaderPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setContainer(document.getElementById(PAGE_HEADER_ID));
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
}

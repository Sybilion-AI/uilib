import cn from 'classnames';
import { ReactNode, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import S from './AppHeader.styl';
import { PAGE_HEADER_ID } from './appChromeAnchors';

export type AppHeaderProps = {
  className?: string;
  /** Override default anchor id when multiple headers exist (e.g. docs demos). */
  anchorId?: string;
  /**
   * Pins the host to the top of its scroll container (`position: sticky; top: 0`).
   * Use with `PageScroll` or any ancestor that scrolls; portaled header content
   * from `AppHeaderPortal` / `SybilionAppHeader` stays inside this element.
   */
  sticky?: boolean;
};

export function AppHeaderHost({
  className,
  anchorId = PAGE_HEADER_ID,
  sticky,
}: AppHeaderProps) {
  return (
    <header
      className={cn(S.root, sticky && S.sticky, className)}
      data-sticky={sticky ? 'true' : 'false'}
      id={anchorId}
    />
  );
}

export type AppHeaderPortalProps = {
  children: ReactNode;
  pageHeaderId?: string;
};

export function AppHeaderPortal({
  children,
  pageHeaderId = PAGE_HEADER_ID,
}: AppHeaderPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setContainer(document.getElementById(pageHeaderId));
  }, [pageHeaderId]);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
}

import cn from 'classnames';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PageContext } from '#uilib/components/ui/Page/pageContext';
import { Scroll } from '@homecode/ui';

import S from './PageScroll.styl';

export type PageScrollProps = {
  children: React.ReactNode;
  className?: string;
  /** Merged onto the outer Scroll root (e.g. embed previews that must not use `100vh`). */
  rootClassName?: string;
  /** Optional external ref for the scrollable inner element (e.g. app scroll restoration). */
  scrollInnerRef?: RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  /** When false, pathname changes do not reset scroll (caller owns navigation scroll). */
  resetScrollOnPathnameChange?: boolean;
};

function PageScrollInner({
  className,
  rootClassName,
  children,
  scrollInnerRef,
  onScroll,
  resetScrollOnPathnameChange,
}: {
  className?: string;
  rootClassName?: string;
  children: React.ReactNode;
  scrollInnerRef: RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  resetScrollOnPathnameChange: boolean;
}) {
  const location = useLocation();

  useEffect(() => {
    if (!resetScrollOnPathnameChange) return;
    scrollInnerRef.current?.scrollTo({ top: 0 });
  }, [location.pathname, resetScrollOnPathnameChange, scrollInnerRef]);

  return (
    <Scroll
      y
      offset={{ y: { before: 120, after: 130 } }}
      className={cn(S.root, rootClassName)}
      autoHide
      innerClassName={cn(S.inner, className)}
      yScrollbarClassName={S.scrollbar}
      onInnerRef={el => {
        scrollInnerRef.current = el;
      }}
      onScroll={onScroll}
    >
      {children}
    </Scroll>
  );
}

export const PageScroll = ({
  children,
  className,
  rootClassName,
  scrollInnerRef: scrollInnerRefProp,
  onScroll,
  resetScrollOnPathnameChange = true,
}: PageScrollProps) => {
  const internalScrollInnerRef = useRef<HTMLDivElement | null>(null);
  const scrollInnerRef = scrollInnerRefProp ?? internalScrollInnerRef;
  const [isScrolled, setIsScrolled] = useState(false);

  const pageContextValue = useMemo(
    () => ({
      isScrolled,
      setIsScrolled,
      getPageScrollElement: () => scrollInnerRef.current,
    }),
    [isScrolled, scrollInnerRef],
  );

  return (
    <PageContext.Provider value={pageContextValue}>
      <PageScrollInner
        className={className}
        rootClassName={rootClassName}
        scrollInnerRef={scrollInnerRef}
        onScroll={onScroll}
        resetScrollOnPathnameChange={resetScrollOnPathnameChange}
      >
        {children}
      </PageScrollInner>
    </PageContext.Provider>
  );
};

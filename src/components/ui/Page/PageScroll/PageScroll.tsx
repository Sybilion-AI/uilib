import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PageContext } from '#uilib/components/ui/Page/pageContext';
import { Scroll } from '@homecode/ui';

import S from './PageScroll.styl';

function PageScrollInner({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  // const { setIsScrolled } = useContext(PageContext);
  // const prevScrollTop = useRef(0);
  const location = useLocation();
  const scrollInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollInnerRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  // const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //   if (e.currentTarget.scrollTop > prevScrollTop.current) {
  //     // if (e.currentTarget.scrollTop > 0) {
  //     setIsScrolled(true);
  //   } else {
  //     setIsScrolled(false);
  //   }
  //   prevScrollTop.current = e.currentTarget.scrollTop;
  // };

  return (
    <Scroll
      y
      // fadeSize="l"
      offset={{ y: { before: 120, after: 130 } }}
      className={S.root}
      autoHide
      innerClassName={cn(S.inner, className)}
      yScrollbarClassName={S.scrollbar}
      onInnerRef={el => {
        scrollInnerRef.current = el;
      }}
      // onScroll={onScroll}
    >
      {children}
    </Scroll>
  );
}

export const PageScroll = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <PageContext.Provider value={{ isScrolled, setIsScrolled }}>
      <PageScrollInner className={className}>{children}</PageScrollInner>
    </PageContext.Provider>
  );
};

import cn from 'classnames';
import { ComponentProps } from 'react';

import { Scroll } from '@homecode/ui';

import S from './SidebarContent.styl';

export function SidebarContent({
  className,
  innerClassName,
  children,
}: ComponentProps<typeof Scroll>) {
  // const sidebarContentTransition = useViewTransition({
  //   transitionName: 'sidebar-content',
  // });

  return (
    <Scroll
      y
      autoHide
      fadeSize="l"
      offset={{ y: { before: 40, after: 20 } }}
      className={cn(S.sidebarContent, className)}
      innerClassName={innerClassName}
    >
      {children}
    </Scroll>
  );
}

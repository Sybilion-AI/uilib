import cn from 'classnames';

import S from './Skeleton.styl';
import { SkeletonProps } from './Skeleton.types';

function Skeleton({
  className,
  size = 'md',
  shape = 'rectangle',
  ...props
}: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(S.root, S[`size-${size}`], S[`shape-${shape}`], className)}
      {...props}
    />
  );
}

export { Skeleton };

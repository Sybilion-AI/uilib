import cn from 'classnames';

import S from './Skeleton.styl';

/**
 * Creates skeleton elements array for repetitive skeleton patterns
 */
export const createSkeletonArray = (count: number, className?: string) => {
  return Array.from({ length: count }, (_, index) => ({
    key: `skeleton-${index}`,
    className: cn(S.root, className),
  }));
};

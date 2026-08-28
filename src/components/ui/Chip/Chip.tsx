import cn from 'classnames';

import { TrendingDown, TrendingUp } from 'lucide-react';

import S from './Chip.styl';
import { ChipProps, ChipSize } from './Chip.types';

const sizeClass = (s: ChipSize) =>
  s === 'xs'
    ? S.sizeXs
    : s === 'sm'
      ? S.sizeSm
      : s === 'md'
        ? S.sizeMd
        : S.sizeLg;

function Chip({
  className,
  variant = 'neutral',
  size = 'sm',
  dot,
  trend,
  squared = false,
  children,
  ref,
  ...props
}: ChipProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  return (
    <span
      ref={ref}
      data-slot="chip"
      data-size={size}
      className={cn(
        S.root,
        S[`variant-${variant}`],
        sizeClass(size),
        squared && S.squared,
        className,
      )}
      {...props}
    >
      {dot && <span className={S.dot} aria-hidden="true" />}
      {TrendIcon && (
        <TrendIcon className={S.arrow} strokeWidth={1.5} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

export { Chip };

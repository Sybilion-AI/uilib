import cn from 'classnames';

import { TrendingDown, TrendingUp } from 'lucide-react';

import S from './Chip.styl';
import { ChipProps } from './Chip.types';

function Chip({
  className,
  variant = 'neutral',
  dot,
  trend,
  squared = false,
  children,
  ...props
}: ChipProps) {
  const showDot = dot ?? (variant === 'neutral' && !squared);
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <span
      data-slot="chip"
      className={cn(
        S.root,
        S[`variant-${variant}`],
        squared && S.squared,
        className,
      )}
      {...props}
    >
      {showDot && <span className={S.dot} aria-hidden="true" />}
      {TrendIcon && (
        <TrendIcon className={S.arrow} strokeWidth={1.5} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

export { Chip };

import { type ComponentProps } from 'react';

export type ChipVariant =
  | 'neutral'
  | 'line'
  | 'active'
  | 'filled'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'yellow';

export type ChipTrend = 'up' | 'down';

export type ChipSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ChipProps extends ComponentProps<'span'> {
  variant?: ChipVariant;
  size?: ChipSize;
  /**
   * Show the 6px status dot. Defaults to true for the neutral variant
   * (when not squared) and false for all others.
   */
  dot?: boolean;
  /** Render a Lucide trend arrow before the label. */
  trend?: ChipTrend;
  /** Use compact squared corners instead of the default pill shape. */
  squared?: boolean;
}

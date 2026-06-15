import { type ComponentProps } from 'react';

export type ChipVariant =
  | 'neutral'
  | 'line'
  | 'active'
  | 'filled'
  | 'accent'
  | 'positive'
  | 'negative';

export type ChipTrend = 'up' | 'down';

export interface ChipProps extends ComponentProps<'span'> {
  variant?: ChipVariant;
  /**
   * Show the 6px status dot. Defaults to true for the neutral variant
   * and false for all others.
   */
  dot?: boolean;
  /** Render a Lucide trend arrow before the label. */
  trend?: ChipTrend;
}

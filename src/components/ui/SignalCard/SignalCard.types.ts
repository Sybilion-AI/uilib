import { type ComponentProps, type ReactNode } from 'react';

export interface SignalCardProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Eyebrow label rendered above the header. */
  kicker?: ReactNode;
  /** Icon rendered in the 40px square header badge. */
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Large metric figure. */
  value?: ReactNode;
  /** Unit suffix rendered after the figure, e.g. "/t". */
  unit?: ReactNode;
  /** Tolerance suffix rendered after the unit, e.g. "± 0.001". */
  tolerance?: ReactNode;
  /** Body copy rendered under the figure. */
  description?: ReactNode;
  /** Delta indicator rendered in the footer, typically a Chip. */
  delta?: ReactNode;
  /** Muted footer meta items, e.g. horizon and confidence. */
  meta?: ReactNode[];
  /** Optional sparkline slot. */
  sparkline?: ReactNode;
}

import { type ComponentProps, type ReactNode } from 'react';

export interface PullQuoteProps extends ComponentProps<'figure'> {
  /** Name of the person quoted. */
  attribution?: ReactNode;
  /** Role or affiliation shown after the attribution, sentence case. */
  attributionRole?: ReactNode;
}

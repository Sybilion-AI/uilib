import { type ComponentProps } from 'react';

export interface KickerProps extends ComponentProps<'div'> {
  /** Render a leading em-dash before the label text. */
  dash?: boolean;
}

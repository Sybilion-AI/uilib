import { type ComponentProps } from 'react';

export interface TextShimmerProps extends ComponentProps<'p'> {
  children: string;
  as?: React.ElementType;
  duration?: number;
  spread?: number;
  inverted?: boolean;
}

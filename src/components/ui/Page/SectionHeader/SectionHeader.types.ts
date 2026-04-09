import { HTMLAttributes, ReactNode } from 'react';

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: ReactNode;
  withMargin?: boolean;
}

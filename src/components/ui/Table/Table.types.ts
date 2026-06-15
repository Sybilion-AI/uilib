import { type ComponentProps } from 'react';

export type TableSize = 'sm' | 'md' | 'lg';

export interface TableProps extends ComponentProps<'table'> {
  size?: TableSize;
  withBackground?: boolean;
  withPaddings?: boolean;
}
export interface TableHeaderProps extends ComponentProps<'thead'> {
  withBorder?: boolean;
}
export interface TableBodyProps extends ComponentProps<'tbody'> {}
export interface TableFooterProps extends ComponentProps<'tfoot'> {}
export interface TableRowProps extends ComponentProps<'tr'> {}
export interface TableHeadProps extends ComponentProps<'th'> {}
export interface TableCellProps extends ComponentProps<'td'> {
  compact?: boolean;
}
export interface TableCaptionProps extends ComponentProps<'caption'> {}

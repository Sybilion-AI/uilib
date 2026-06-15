import cn from 'classnames';

import S from './Table.styl';
import type {
  TableBodyProps,
  TableCaptionProps,
  TableCellProps,
  TableFooterProps,
  TableHeadProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
} from './Table.types';

function Table({
  className,
  size = 'md',
  withBackground = false,
  withPaddings = false,
  ...props
}: TableProps) {
  return (
    <table
      data-slot="table"
      data-size={size}
      className={cn(
        S.table,
        className,
        withBackground && S.withBackground,
        withPaddings && S.withPaddings,
      )}
      {...props}
    />
  );
}

function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(S.tableHead, className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(S.tableBody, className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(S.tableFooter, className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(S.tableRow, className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(S.tableHead, className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(S.tableCell, className)}
      {...props}
    />
  );
}

function TableCellValue({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(S.cellValue, className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCellValue,
};

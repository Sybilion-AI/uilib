import type { TableBodyProps, TableCaptionProps, TableCellProps, TableFooterProps, TableHeadProps, TableHeaderProps, TableProps, TableRowProps } from './Table.types';
declare function Table({ className, withBackground, withPaddings, ...props }: TableProps & {
    withBackground?: boolean;
    withPaddings?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function TableHeader({ className, ...props }: TableHeaderProps): import("react/jsx-runtime").JSX.Element;
declare function TableBody({ className, ...props }: TableBodyProps): import("react/jsx-runtime").JSX.Element;
declare function TableFooter({ className, ...props }: TableFooterProps): import("react/jsx-runtime").JSX.Element;
declare function TableRow({ className, ...props }: TableRowProps): import("react/jsx-runtime").JSX.Element;
declare function TableHead({ className, ...props }: TableHeadProps): import("react/jsx-runtime").JSX.Element;
declare function TableCell({ className, compact, ...props }: TableCellProps): import("react/jsx-runtime").JSX.Element;
declare function TableCellValue({ className, ...props }: TableCaptionProps): import("react/jsx-runtime").JSX.Element;
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCellValue, };

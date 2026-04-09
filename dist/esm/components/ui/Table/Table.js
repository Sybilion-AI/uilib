import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './Table.styl.js';

function Table({ className, withBackground = false, withPaddings = false, ...props }) {
    return (jsx("table", { "data-slot": "table", className: cn(S.table, className, withBackground && S.withBackground, withPaddings && S.withPaddings), ...props }));
}
function TableHeader({ className, ...props }) {
    return (jsx("thead", { "data-slot": "table-header", className: cn(S.tableHead, className), ...props }));
}
function TableBody({ className, ...props }) {
    return (jsx("tbody", { "data-slot": "table-body", className: cn(S.tableBody, className), ...props }));
}
function TableFooter({ className, ...props }) {
    return (jsx("tfoot", { "data-slot": "table-footer", className: cn(S.tableFooter, className), ...props }));
}
function TableRow({ className, ...props }) {
    return (jsx("tr", { "data-slot": "table-row", className: cn(S.tableRow, className), ...props }));
}
function TableHead({ className, ...props }) {
    return (jsx("th", { "data-slot": "table-head", className: cn(S.tableHead, className), ...props }));
}
function TableCell({ className, compact, ...props }) {
    return (jsx("td", { "data-slot": "table-cell", className: cn(S.tableCell, compact && S.compact, className), ...props }));
}
function TableCellValue({ className, ...props }) {
    return (jsx("caption", { "data-slot": "table-caption", className: cn(S.cellValue, className), ...props }));
}

export { Table, TableBody, TableCell, TableCellValue, TableFooter, TableHead, TableHeader, TableRow };

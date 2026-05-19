import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { CsvIcon } from '../../icons/CsvIcon/CsvIcon.js';
import { CardHeader, CardAction } from '../Card/Card.js';
import { XIcon, FileTextIcon } from '@phosphor-icons/react';
import S from './FileChip.styl.js';

const FORMAT_ICON_SIZE = 32;
function FormatIcon({ format }) {
    if (format === 'csv') {
        return jsx(CsvIcon, { size: FORMAT_ICON_SIZE });
    }
    return (jsx(FileTextIcon, { size: FORMAT_ICON_SIZE, "aria-hidden": true, style: { color: 'var(--muted-foreground)' } }));
}
function FileChipHeader({ name, format, hint, onRemove, }) {
    return (jsx(CardHeader, { className: S.header, icon: jsx(FormatIcon, { format: format }), title: name, description: hint, titleClassName: S.title, descriptionClassName: S.hint, tooltipProps: { maxWidth: 400 }, children: onRemove ? (jsx(CardAction, { children: jsx("button", { type: "button", className: S.remove, "aria-label": `Remove ${name}`, onClick: onRemove, children: jsx(XIcon, { size: 14, "aria-hidden": true }) }) })) : null }));
}
function FileChip({ name, format, hint, onClick, onRemove, className, }) {
    const header = (jsx(FileChipHeader, { name: name, format: format, hint: hint, onRemove: onRemove }));
    if (onClick) {
        return (jsx("button", { type: "button", className: cn(S.root, S.interactive, className), "aria-label": `${hint}: ${name}`, onClick: onClick, children: header }));
    }
    return (jsx("div", { className: cn(S.root, className), role: "group", children: header }));
}

export { FileChip };

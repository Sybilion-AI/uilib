import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useEffect, useCallback, useImperativeHandle } from 'react';
import S from './SlashSuggestionList.styl.js';

function SlashSuggestionListInner({ items, command, listHandleRef, }) {
    const [selected, setSelected] = useState(0);
    useEffect(() => {
        setSelected(s => Math.min(s, Math.max(items.length - 1, 0)));
    }, [items.length]);
    const safeSel = Math.min(selected, Math.max(items.length - 1, 0));
    const onPick = useCallback((index) => {
        const item = items[index];
        if (!item)
            return;
        command(item);
    }, [command, items]);
    const onKeyboardEvent = useCallback((event) => {
        if (items.length === 0)
            return false;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelected(s => Math.min(s + 1, items.length - 1));
            return true;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelected(s => Math.max(s - 1, 0));
            return true;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            const max = Math.max(items.length - 1, 0);
            const idx = Math.min(selected, max);
            const item = items[idx];
            if (item)
                command(item);
            return true;
        }
        return false;
    }, [command, items, selected]);
    useImperativeHandle(listHandleRef, () => ({ onKeyboardEvent }), [
        onKeyboardEvent,
    ]);
    return (jsx("div", { className: S.root, role: "listbox", "aria-label": "Slash commands", children: items.map((item, idx) => (jsxs("button", { type: "button", role: "option", "aria-selected": idx === safeSel, className: cn(S.item, idx === safeSel && S.itemHighlighted), onMouseDown: e => e.preventDefault(), onMouseEnter: () => setSelected(idx), onClick: () => onPick(idx), children: [jsxs("span", { className: S.itemLabel, children: ["/", item.label] }), item.description ? (jsx("span", { className: S.itemDesc, children: item.description })) : null] }, `${item.id}-${idx}`))) }));
}
function SlashSuggestionList(props) {
    if (props.items.length === 0)
        return null;
    return (jsx(SlashSuggestionListInner, { items: props.items, command: props.command, listHandleRef: props.listHandleRef }));
}

export { SlashSuggestionList };

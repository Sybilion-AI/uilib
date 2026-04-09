import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useEffect } from 'react';
import { Button } from '../../Button/Button.js';
import S from './ChatPresets.styl.js';

function ChatPresets({ chatId, items, usedItemIds = [], layout = 'fixed', onSelect, onItemUsed, }) {
    const [localUsedItems, setLocalUsedItems] = useState([]);
    useEffect(() => {
        setLocalUsedItems([]);
    }, [chatId]);
    const usedItems = [...new Set([...usedItemIds, ...localUsedItems])];
    const availableItems = items.filter(item => !usedItems.includes(item.id));
    if (availableItems.length === 0)
        return null;
    return (jsx("div", { className: layout === 'inline' ? S.inlineRoot : S.root, children: jsx("div", { className: cn(S.inner, layout === 'inline' && S.innerInline), children: availableItems.map(preset => (jsx(Button, { type: "button", className: cn(S.item), onClick: () => {
                    onSelect?.(preset);
                    onItemUsed?.(preset.id);
                    setLocalUsedItems(prev => [...prev, preset.id]);
                }, children: preset.text }, preset.id))) }) }));
}

export { ChatPresets };

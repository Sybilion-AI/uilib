import cn from 'classnames';
import { useEffect, useState } from 'react';

import { Button } from '#uilib/components/ui/Button';

import type { ChatPreset } from '../Chat.types';
import S from './ChatPresets.styl';

export type ChatPresetsLayout = 'fixed' | 'inline';

export interface ChatPresetsProps {
  chatId: string;
  items: ChatPreset[];
  usedItemIds?: string[];
  layout?: ChatPresetsLayout;
  onSelect?: (preset: ChatPreset) => void;
  onItemUsed?: (id: string) => void;
}

export function ChatPresets({
  chatId,
  items,
  usedItemIds = [],
  layout = 'fixed',
  onSelect,
  onItemUsed,
}: ChatPresetsProps) {
  const [localUsedItems, setLocalUsedItems] = useState<string[]>([]);

  useEffect(() => {
    setLocalUsedItems([]);
  }, [chatId]);

  const usedItems = [...new Set([...usedItemIds, ...localUsedItems])];
  const availableItems = items.filter(item => !usedItems.includes(item.id));

  if (availableItems.length === 0) return null;

  return (
    <div className={layout === 'inline' ? S.inlineRoot : S.root}>
      <div className={cn(S.inner, layout === 'inline' && S.innerInline)}>
        {availableItems.map(preset => (
          <Button
            key={preset.id}
            type="button"
            variant="outline"
            size="sm"
            className={cn(S.item)}
            onClick={() => {
              onSelect?.(preset);
              onItemUsed?.(preset.id);
              setLocalUsedItems(prev => [...prev, preset.id]);
            }}
          >
            {preset.text}
          </Button>
        ))}
      </div>
    </div>
  );
}

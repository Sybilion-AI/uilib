import cn from 'classnames';
import type { RefObject } from 'react';
import { useCallback, useEffect, useImperativeHandle, useState } from 'react';

import S from './SlashSuggestionList.styl';
import type { SlashCommandItem } from './types';

export type SlashSuggestionListHandle = {
  onKeyboardEvent: (event: KeyboardEvent) => boolean;
};

type SlashSuggestionListInnerProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  listHandleRef: RefObject<SlashSuggestionListHandle | null>;
};

function SlashSuggestionListInner({
  items,
  command,
  listHandleRef,
}: SlashSuggestionListInnerProps) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setSelected(s => Math.min(s, Math.max(items.length - 1, 0)));
  }, [items.length]);

  const safeSel = Math.min(selected, Math.max(items.length - 1, 0));

  const onPick = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) return;
      command(item);
    },
    [command, items],
  );

  const onKeyboardEvent = useCallback(
    (event: KeyboardEvent): boolean => {
      if (items.length === 0) return false;
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
        if (item) command(item);
        return true;
      }
      return false;
    },
    [command, items, selected],
  );

  useImperativeHandle(listHandleRef, () => ({ onKeyboardEvent }), [
    onKeyboardEvent,
  ]);

  return (
    <div className={S.root} role="listbox" aria-label="Slash commands">
      {items.map((item, idx) => (
        <button
          key={`${item.id}-${idx}`}
          type="button"
          role="option"
          aria-selected={idx === safeSel}
          className={cn(S.item, idx === safeSel && S.itemHighlighted)}
          onMouseDown={e => e.preventDefault()}
          onMouseEnter={() => setSelected(idx)}
          onClick={() => onPick(idx)}
        >
          <span className={S.itemLabel}>/{item.label}</span>
          {item.description ? (
            <span className={S.itemDesc}>{item.description}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/** Props forwarded from Tiptap suggestion renderer + our wiring. */
export type SlashSuggestionListProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  listHandleRef: RefObject<SlashSuggestionListHandle | null>;
};

export function SlashSuggestionList(props: SlashSuggestionListProps) {
  if (props.items.length === 0) return null;
  return (
    <SlashSuggestionListInner
      items={props.items}
      command={props.command}
      listHandleRef={props.listHandleRef}
    />
  );
}

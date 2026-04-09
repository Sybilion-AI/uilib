import type { ChatPreset } from '../Chat.types';
export type ChatPresetsLayout = 'fixed' | 'inline';
export interface ChatPresetsProps {
    chatId: string;
    items: ChatPreset[];
    usedItemIds?: string[];
    layout?: ChatPresetsLayout;
    onSelect?: (preset: ChatPreset) => void;
    onItemUsed?: (id: string) => void;
}
export declare function ChatPresets({ chatId, items, usedItemIds, layout, onSelect, onItemUsed, }: ChatPresetsProps): import("react/jsx-runtime").JSX.Element;

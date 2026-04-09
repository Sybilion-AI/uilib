import { ChatPresets } from '#uilib/components/ui/Chat/ChatPresets';
import type { ChatProps } from './Chat.types';
import { ChatEmptyState } from './ChatEmptyState/ChatEmptyState';
import { ChatMessage } from './ChatMessage';
import { ChatPrompt } from './ChatPrompt';
export declare function Chat({ children, className, isEmpty, ...props }: ChatProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Chat {
    var Prompt: typeof ChatPrompt;
    var Message: typeof ChatMessage;
    var Presets: typeof ChatPresets;
    var EmptyState: typeof ChatEmptyState;
}

import type { ChatAttachmentDropItem } from '../Chat.types';
type ChatPromptAttachmentsProps = {
    attachments: ChatAttachmentDropItem[];
    onRemove: (index: number) => void;
    disabled?: boolean;
};
export declare function ChatPromptAttachments({ attachments, onRemove, disabled, }: ChatPromptAttachmentsProps): import("react/jsx-runtime").JSX.Element;
export {};

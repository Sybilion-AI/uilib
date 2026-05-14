export interface ChatSelectorProps {
    id: string;
    className?: string;
    onChatDeleted?: (sessionId: string) => void;
}
export declare function ChatSelector({ id, className, onChatDeleted, }: ChatSelectorProps): import("react/jsx-runtime").JSX.Element;

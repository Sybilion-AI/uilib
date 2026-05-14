export interface ChatEmptyStateProps {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    /** Extra block below description (works when passed via `ChatChrome` / `ChatSheet` `emptyState`). */
    additionalContent?: React.ReactNode;
}

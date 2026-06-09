import type { ChatPreset } from '#uilib/components/ui/Chat/Chat.types';

export type SubmitPresetOptions = {
  /** Composer text when preset row includes addon context (e.g. live news URL). */
  message?: string;
};

export type ChatEmptyStateContext = {
  submitPreset: (
    preset: ChatPreset,
    options?: SubmitPresetOptions,
  ) => void | Promise<void>;
};

export interface ChatEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  className?: string;
  description?: string;
  /** Extra block below description (resolved before render in `ChatEmptyState`). */
  additionalContent?: React.ReactNode;
}

/** Passed to `ChatSheet` / `useChatPanelChromeModel`; function form resolved before render. */
export interface ChatEmptyStateConfig extends Omit<
  ChatEmptyStateProps,
  'additionalContent'
> {
  additionalContent?:
    | React.ReactNode
    | ((ctx: ChatEmptyStateContext) => React.ReactNode);
}

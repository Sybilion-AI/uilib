import { createPortal } from 'react-dom';

import { Button } from '../../Button';
import { ChatChrome } from '../ChatChrome';
import {
  type UseChatPanelChromeModelInput,
  useChatPanelChromeModel,
} from './useChatPanelChromeModel';

export type ChatSheetActions = {
  open: () => void;
  /** Starts a new chat session and opens the panel (same as the new-chat keyboard shortcut). */
  openNewChat: () => void;
};

export interface ChatSheetProps extends Omit<
  UseChatPanelChromeModelInput,
  'embedAsPage'
> {
  title?: string;
  /** Imperative open / new-chat for triggers outside `renderTrigger` (e.g. sidebar). */
  actionsRef?: React.MutableRefObject<ChatSheetActions | null>;
  renderTrigger?: (toggleOpen: () => void) => React.ReactNode;
  triggerLabel?: React.ReactNode;
  /** aria-label for icon-only trigger (required when trigger has no visible text) */
  triggerAriaLabel?: string;
  label?: string;
  /**
   * Render chat panel in place (no trigger, no portal, no `?chat=` URL, no shell chat slot).
   * Prefer composing `ChatChrome` with `useChatPanelChromeModel({ embedAsPage: true, ... })` on the page.
   */
  inline?: boolean;
}

export function ChatSheet({
  triggerLabel = 'Open Chat',
  triggerAriaLabel,
  actionsRef,
  renderTrigger,
  presets,
  scopeId,
  onMessage,
  onScriptComplete,
  onGenerateDashboard,
  renderMessageChart,
  emptyState,
  inline = false,
}: ChatSheetProps) {
  const model = useChatPanelChromeModel({
    embedAsPage: inline,
    presets,
    scopeId,
    onMessage,
    onScriptComplete,
    onGenerateDashboard,
    renderMessageChart,
    emptyState,
  });

  if (actionsRef) {
    actionsRef.current = {
      open: () => model.onOpenChange(true),
      openNewChat: () => {
        model.newChat();
        model.onOpenChange(true);
      },
    };
  }

  if (inline) {
    return <ChatChrome {...model.chromeProps} />;
  }

  return (
    <>
      {renderTrigger?.(model.toggleOpen) ?? (
        <Button
          variant="outline"
          aria-label={triggerAriaLabel}
          onClick={model.toggleOpen}
        >
          {triggerLabel}
        </Button>
      )}
      {model.isOpen &&
        model.chatPanelContainer &&
        createPortal(
          <ChatChrome {...model.chromeProps} />,
          model.chatPanelContainer,
        )}
    </>
  );
}

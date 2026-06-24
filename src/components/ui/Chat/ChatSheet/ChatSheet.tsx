import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '../../Button';
import { ChatChrome } from '../ChatChrome';
import {
  type UseChatPanelChromeModelInput,
  useChatPanelChromeModel,
} from './useChatPanelChromeModel';

export type ChatSheetActions = {
  open: () => void;
  /** Starts an empty chat session and opens the panel (same as Cmd/Ctrl+0). */
  openNewChat: () => void;
  /** Starts a new chat, opens the panel, and pre-fills the composer (user sends manually). */
  openNewChatWithPrefill: (prompt: string) => void;
  /** Starts a new chat, opens panel, and sends prompt immediately. */
  openNewChatAndSubmit: (prompt: string) => void;
};

export interface ChatSheetProps extends Omit<
  UseChatPanelChromeModelInput,
  'embedAsPage'
> {
  title?: string;
  /** Imperative open / new-chat for triggers outside `renderTrigger` (e.g. sidebar). */
  actionsRef?: React.MutableRefObject<ChatSheetActions | null>;
  renderTrigger?: (toggleOpen: () => void, isOpen: boolean) => React.ReactNode;
  triggerIcon?: React.ReactNode;
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
  triggerIcon,
  triggerLabel,
  triggerAriaLabel,
  actionsRef,
  renderTrigger,
  presets,
  scopeId,
  onMessage,
  onScriptComplete,
  renderMessageChart,
  renderSystemMessage,
  emptyState,
  allowedAttachments,
  allowPdfAttachments,
  onAttachmentsDropped,
  slashCommandItems,
  onSlashItemCommand,
  transformSendPayload,
  inline = false,
}: ChatSheetProps) {
  const model = useChatPanelChromeModel({
    embedAsPage: inline,
    presets,
    scopeId,
    onMessage,
    onScriptComplete,
    renderMessageChart,
    renderSystemMessage,
    emptyState,
    allowedAttachments,
    allowPdfAttachments,
    onAttachmentsDropped,
    slashCommandItems,
    onSlashItemCommand,
    transformSendPayload,
  });

  if (actionsRef) {
    actionsRef.current = {
      open: () => model.onOpenChange(true),
      openNewChat: () => {
        model.newChat();
        model.onOpenChange(true);
      },
      openNewChatWithPrefill: model.openNewChatWithPrefill,
      openNewChatAndSubmit: model.openNewChatAndSubmit,
    };
  }

  const [chromePortalReady, setChromePortalReady] = useState(false);

  useEffect(() => {
    if (!model.isOpen) {
      setChromePortalReady(false);
      return;
    }
    const frameId = requestAnimationFrame(() => {
      setChromePortalReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [model.isOpen]);

  if (inline) {
    return <ChatChrome {...model.chromeProps} />;
  }

  return (
    <>
      {renderTrigger?.(model.toggleOpen, model.isOpen) ?? (
        <Button
          icon={!triggerLabel}
          variant="outline"
          aria-label={triggerAriaLabel}
          onClick={model.toggleOpen}
        >
          {triggerIcon ?? triggerLabel}
        </Button>
      )}
      {model.isOpen &&
        chromePortalReady &&
        model.chatPanelContainer &&
        createPortal(
          <ChatChrome {...model.chromeProps} />,
          model.chatPanelContainer,
        )}
    </>
  );
}

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';
import { Button } from '../../Button/Button.js';
import { ChatChrome } from '../ChatChrome/ChatChrome.js';
import { useChatPanelChromeModel } from './useChatPanelChromeModel.js';

function ChatSheet({ triggerLabel = 'Open Chat', triggerAriaLabel, actionsRef, renderTrigger, presets, scopeId, onMessage, onScriptComplete, onGenerateDashboard, renderMessageChart, emptyState, allowedAttachments, allowPdfAttachments, onAttachmentsDropped, inline = false, }) {
    const model = useChatPanelChromeModel({
        embedAsPage: inline,
        presets,
        scopeId,
        onMessage,
        onScriptComplete,
        onGenerateDashboard,
        renderMessageChart,
        emptyState,
        allowedAttachments,
        allowPdfAttachments,
        onAttachmentsDropped,
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
        return jsx(ChatChrome, { ...model.chromeProps });
    }
    return (jsxs(Fragment, { children: [renderTrigger?.(model.toggleOpen) ?? (jsx(Button, { variant: "outline", "aria-label": triggerAriaLabel, onClick: model.toggleOpen, children: triggerLabel })), model.isOpen &&
                model.chatPanelContainer &&
                createPortal(jsx(ChatChrome, { ...model.chromeProps }), model.chatPanelContainer)] }));
}

export { ChatSheet };

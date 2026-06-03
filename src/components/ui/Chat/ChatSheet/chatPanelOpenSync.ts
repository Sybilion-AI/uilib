/** Pure guards for chat panel URL ↔ shell sync (unit-tested). */

export function shouldOpenChatFromUrl(
  chatOpen: boolean,
  layoutDismissed: boolean,
): boolean {
  return chatOpen && !layoutDismissed;
}

export function shouldHealChatShellDesync(
  chatOpen: boolean,
  shellChatPanelOpen: boolean,
  layoutDismissed: boolean,
  isOpen: boolean,
): boolean {
  if (!chatOpen || shellChatPanelOpen) {
    return false;
  }
  if (layoutDismissed && !isOpen) {
    return false;
  }
  return true;
}

export function shouldCloseStaleLocalChatOpen(
  shellChatPanelOpen: boolean,
  chatOpen: boolean,
  isOpen: boolean,
): boolean {
  return !shellChatPanelOpen && !chatOpen && isOpen;
}

/** Shell still reserves width but no instance is showing chat (e.g. route change dropped `?chat=`). */
export function shouldCloseOrphanShellChat(
  shellChatPanelOpen: boolean,
  chatOpen: boolean,
  isOpen: boolean,
): boolean {
  return shellChatPanelOpen && !chatOpen && !isOpen;
}

/** App shell: collapse chat column when URL has no `?chat=` (no mounted ChatSheet required). */
export function shouldCollapseShellChatWithoutUrlParam(
  hasChatUrlParam: boolean,
): boolean {
  return !hasChatUrlParam;
}

export function shouldDismissChatAfterShellClosed(params: {
  shellChatPanelOpen: boolean;
  wasShellChatPanelOpen: boolean;
  chatOpen: boolean;
  isOpen: boolean;
  openedShellChat: boolean;
}): boolean {
  const {
    shellChatPanelOpen,
    wasShellChatPanelOpen,
    chatOpen,
    isOpen,
    openedShellChat,
  } = params;
  if (shellChatPanelOpen || !wasShellChatPanelOpen || !chatOpen) {
    return false;
  }
  return isOpen || openedShellChat;
}

export function isChatPanelVisible(
  isOpen: boolean,
  shellChatPanelOpen: boolean,
): boolean {
  return isOpen && shellChatPanelOpen;
}

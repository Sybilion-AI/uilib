import {
  isChatPanelVisible,
  shouldCloseOrphanShellChat,
  shouldCloseStaleLocalChatOpen,
  shouldCollapseShellChatWithoutUrlParam,
  shouldDismissChatAfterShellClosed,
  shouldHealChatShellDesync,
  shouldOpenChatFromUrl,
} from './chatPanelOpenSync';

describe('shouldOpenChatFromUrl', () => {
  it('opens when ?chat= is set and layout has not dismissed chat', () => {
    expect(shouldOpenChatFromUrl(true, false)).toBe(true);
  });

  it('blocks reopen in the same tick after nav layout dismiss', () => {
    expect(shouldOpenChatFromUrl(true, true)).toBe(false);
  });
});

describe('shouldHealChatShellDesync', () => {
  it('heals when URL requests chat but shell slot is closed', () => {
    expect(shouldHealChatShellDesync(true, false, false, false)).toBe(true);
  });

  it('skips heal after layout dismiss cleared local open', () => {
    expect(shouldHealChatShellDesync(true, false, true, false)).toBe(false);
  });
});

describe('shouldCloseStaleLocalChatOpen', () => {
  it('closes local open when shell and URL are both closed', () => {
    expect(shouldCloseStaleLocalChatOpen(false, false, true)).toBe(true);
  });

  it('keeps local open while ?chat= remains', () => {
    expect(shouldCloseStaleLocalChatOpen(false, true, true)).toBe(false);
  });
});

describe('shouldCollapseShellChatWithoutUrlParam', () => {
  it('collapses when chat param absent', () => {
    expect(shouldCollapseShellChatWithoutUrlParam(false)).toBe(true);
  });

  it('keeps shell when chat param present', () => {
    expect(shouldCollapseShellChatWithoutUrlParam(true)).toBe(false);
  });
});

describe('shouldCloseOrphanShellChat', () => {
  it('closes shell slot when URL and local UI are both closed', () => {
    expect(shouldCloseOrphanShellChat(true, false, false)).toBe(true);
  });

  it('keeps shell while ?chat= requests panel', () => {
    expect(shouldCloseOrphanShellChat(true, true, false)).toBe(false);
  });

  it('keeps shell while this instance still renders chat', () => {
    expect(shouldCloseOrphanShellChat(true, false, true)).toBe(false);
  });
});

describe('shouldDismissChatAfterShellClosed', () => {
  it('dismisses when shell closes with ?chat= and this instance opened chat', () => {
    expect(
      shouldDismissChatAfterShellClosed({
        shellChatPanelOpen: false,
        wasShellChatPanelOpen: true,
        chatOpen: true,
        isOpen: true,
        openedShellChat: true,
      }),
    ).toBe(true);
  });

  it('ignores shell close when URL has no chat param', () => {
    expect(
      shouldDismissChatAfterShellClosed({
        shellChatPanelOpen: false,
        wasShellChatPanelOpen: true,
        chatOpen: false,
        isOpen: true,
        openedShellChat: true,
      }),
    ).toBe(false);
  });

  it('ignores unrelated shell close without local or instance ownership', () => {
    expect(
      shouldDismissChatAfterShellClosed({
        shellChatPanelOpen: false,
        wasShellChatPanelOpen: true,
        chatOpen: true,
        isOpen: false,
        openedShellChat: false,
      }),
    ).toBe(false);
  });
});

describe('isChatPanelVisible', () => {
  it('is visible only when local and shell are both open', () => {
    expect(isChatPanelVisible(true, true)).toBe(true);
    expect(isChatPanelVisible(true, false)).toBe(false);
    expect(isChatPanelVisible(false, true)).toBe(false);
  });
});

const SIDEBAR_WIDTH_STORAGE_KEY_PX = 'sidebarWidthPx';
const SIDEBAR_WIDTH_STORAGE_KEY_PCT = 'sidebarWidthPercent';
const CHAT_WIDTH_STORAGE_KEY = 'chatWidthPx';
const SIDEBAR_WIDTH_MIN_PX = 300;
const CHAT_WIDTH_MIN_PX = 500;
const SIDEBAR_WIDTH_DEFAULT_PX = 300;
const CHAT_WIDTH_DEFAULT_PX = 800;
const SHELL_MAX_FRACTION = 0.4;
const CHAT_WIDTH_ABS_MAX_PX = 800;
const CENTRAL_AREA_MIN_PX = 800;
function maxSidebarWidthPx(shellWidth) {
    return Math.floor(shellWidth * SHELL_MAX_FRACTION);
}
function maxChatWidthPx(shellWidth) {
    return Math.min(CHAT_WIDTH_ABS_MAX_PX, maxSidebarWidthPx(shellWidth));
}
function clampWithPanelMin(px, panelMin, maxPx) {
    const hi = Math.max(0, maxPx);
    const lo = Math.min(panelMin, hi);
    return Math.max(lo, Math.min(hi, Math.round(px)));
}
function clampSidebarWidthPx(px, shellWidth, opts) {
    if (shellWidth <= 0) {
        return Math.max(SIDEBAR_WIDTH_MIN_PX, Math.round(px));
    }
    const maxFraction = maxSidebarWidthPx(shellWidth);
    const reservedChat = opts.chatPanelOpen ? opts.chatWidthPx : 0;
    const capCentral = shellWidth - CENTRAL_AREA_MIN_PX - reservedChat;
    const maxPx = Math.min(maxFraction, capCentral);
    return clampWithPanelMin(px, SIDEBAR_WIDTH_MIN_PX, maxPx);
}
/** Width that reduces the main column when the nav sidebar is expanded; use 0 when collapsed. */
function clampChatWidthPx(px, shellWidth, effectiveSidebarWidthPx) {
    if (shellWidth <= 0) {
        return Math.max(CHAT_WIDTH_MIN_PX, Math.round(px));
    }
    const maxFraction = maxChatWidthPx(shellWidth);
    const capCentral = shellWidth - CENTRAL_AREA_MIN_PX - effectiveSidebarWidthPx;
    const maxPx = Math.min(maxFraction, capCentral);
    return clampWithPanelMin(px, CHAT_WIDTH_MIN_PX, maxPx);
}
function defaultChatWidthPx(shellWidth) {
    return clampChatWidthPx(CHAT_WIDTH_DEFAULT_PX, shellWidth, SIDEBAR_WIDTH_DEFAULT_PX);
}

export { CENTRAL_AREA_MIN_PX, CHAT_WIDTH_ABS_MAX_PX, CHAT_WIDTH_DEFAULT_PX, CHAT_WIDTH_MIN_PX, CHAT_WIDTH_STORAGE_KEY, SHELL_MAX_FRACTION, SIDEBAR_WIDTH_DEFAULT_PX, SIDEBAR_WIDTH_MIN_PX, SIDEBAR_WIDTH_STORAGE_KEY_PCT, SIDEBAR_WIDTH_STORAGE_KEY_PX, clampChatWidthPx, clampSidebarWidthPx, defaultChatWidthPx, maxChatWidthPx, maxSidebarWidthPx };

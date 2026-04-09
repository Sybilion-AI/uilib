export const SIDEBAR_WIDTH_STORAGE_KEY_PX = 'sidebarWidthPx';
export const SIDEBAR_WIDTH_STORAGE_KEY_PCT = 'sidebarWidthPercent';
export const CHAT_WIDTH_STORAGE_KEY = 'chatWidthPx';

export const SIDEBAR_WIDTH_MIN_PX = 300;
export const CHAT_WIDTH_MIN_PX = 500;
export const SIDEBAR_WIDTH_DEFAULT_PX = 300;
export const CHAT_WIDTH_DEFAULT_PX = 800;
export const SHELL_MAX_FRACTION = 0.4;
export const CHAT_WIDTH_ABS_MAX_PX = 800;
export const CENTRAL_AREA_MIN_PX = 800;

export type ClampSidebarWidthOpts = {
  chatPanelOpen: boolean;
  chatWidthPx: number;
};

export function maxSidebarWidthPx(shellWidth: number): number {
  return Math.floor(shellWidth * SHELL_MAX_FRACTION);
}

export function maxChatWidthPx(shellWidth: number): number {
  return Math.min(CHAT_WIDTH_ABS_MAX_PX, maxSidebarWidthPx(shellWidth));
}

function clampWithPanelMin(
  px: number,
  panelMin: number,
  maxPx: number,
): number {
  const hi = Math.max(0, maxPx);
  const lo = Math.min(panelMin, hi);
  return Math.max(lo, Math.min(hi, Math.round(px)));
}

export function clampSidebarWidthPx(
  px: number,
  shellWidth: number,
  opts: ClampSidebarWidthOpts,
): number {
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
export function clampChatWidthPx(
  px: number,
  shellWidth: number,
  effectiveSidebarWidthPx: number,
): number {
  if (shellWidth <= 0) {
    return Math.max(CHAT_WIDTH_MIN_PX, Math.round(px));
  }
  const maxFraction = maxChatWidthPx(shellWidth);
  const capCentral = shellWidth - CENTRAL_AREA_MIN_PX - effectiveSidebarWidthPx;
  const maxPx = Math.min(maxFraction, capCentral);
  return clampWithPanelMin(px, CHAT_WIDTH_MIN_PX, maxPx);
}

export function defaultChatWidthPx(shellWidth: number): number {
  return clampChatWidthPx(
    CHAT_WIDTH_DEFAULT_PX,
    shellWidth,
    SIDEBAR_WIDTH_DEFAULT_PX,
  );
}

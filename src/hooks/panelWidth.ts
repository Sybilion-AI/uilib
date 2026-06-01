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

/** Viewport below this uses sheet sidebar + single-column shell (central + sidebar mins cannot coexist). */
export const SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX =
  CENTRAL_AREA_MIN_PX + SIDEBAR_WIDTH_MIN_PX;

/** `max-width` for media queries (`innerWidth < SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX`). */
export const SIDEBAR_SHEET_LAYOUT_MAX_WIDTH_PX =
  SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX - 1;

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

export type SidebarsLayoutWidths = {
  mainSidebarOpen: boolean;
  chatPanelOpen: boolean;
  sidebarWidthPx: number;
  chatWidthPx: number;
};

/**
 * Stored width can fall below panel min when the shell was narrow (clamp cap < min).
 * For dual-panel fit checks, treat open panels as at least their min width.
 */
function effectiveOpenPanelWidthPx(
  px: number,
  minPx: number,
  bothPanelsOpen: boolean,
): number {
  if (bothPanelsOpen) {
    return Math.max(px, minPx);
  }
  return px > 0 ? px : minPx;
}

/** Minimum shell width when nav and/or chat panels are open (main column at least `CENTRAL_AREA_MIN_PX`). */
export function requiredShellWidthForSidebars(
  widths: SidebarsLayoutWidths,
): number {
  const bothPanelsOpen =
    widths.mainSidebarOpen && widths.chatPanelOpen;
  const sidebarW = widths.mainSidebarOpen
    ? effectiveOpenPanelWidthPx(
        widths.sidebarWidthPx,
        SIDEBAR_WIDTH_MIN_PX,
        bothPanelsOpen,
      )
    : 0;
  const chatW = widths.chatPanelOpen
    ? effectiveOpenPanelWidthPx(
        widths.chatWidthPx,
        CHAT_WIDTH_MIN_PX,
        bothPanelsOpen,
      )
    : 0;
  return sidebarW + CENTRAL_AREA_MIN_PX + chatW;
}

export function shellFitsSidebarsLayout(
  shellWidth: number,
  widths: SidebarsLayoutWidths,
): boolean {
  if (shellWidth <= 0) return true;
  return shellWidth >= requiredShellWidthForSidebars(widths);
}

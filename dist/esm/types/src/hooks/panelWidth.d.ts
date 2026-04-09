export declare const SIDEBAR_WIDTH_STORAGE_KEY_PX = "sidebarWidthPx";
export declare const SIDEBAR_WIDTH_STORAGE_KEY_PCT = "sidebarWidthPercent";
export declare const CHAT_WIDTH_STORAGE_KEY = "chatWidthPx";
export declare const SIDEBAR_WIDTH_MIN_PX = 300;
export declare const CHAT_WIDTH_MIN_PX = 500;
export declare const SIDEBAR_WIDTH_DEFAULT_PX = 300;
export declare const CHAT_WIDTH_DEFAULT_PX = 800;
export declare const SHELL_MAX_FRACTION = 0.4;
export declare const CHAT_WIDTH_ABS_MAX_PX = 800;
export declare const CENTRAL_AREA_MIN_PX = 800;
export type ClampSidebarWidthOpts = {
    chatPanelOpen: boolean;
    chatWidthPx: number;
};
export declare function maxSidebarWidthPx(shellWidth: number): number;
export declare function maxChatWidthPx(shellWidth: number): number;
export declare function clampSidebarWidthPx(px: number, shellWidth: number, opts: ClampSidebarWidthOpts): number;
/** Width that reduces the main column when the nav sidebar is expanded; use 0 when collapsed. */
export declare function clampChatWidthPx(px: number, shellWidth: number, effectiveSidebarWidthPx: number): number;
export declare function defaultChatWidthPx(shellWidth: number): number;

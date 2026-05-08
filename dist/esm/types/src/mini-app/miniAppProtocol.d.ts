/**
 * postMessage protocol for Sybilion workspace mini-apps (iframe child).
 * Keep in sync with sybilion-client `src/workspace/miniAppBridge.ts` (channel, version, payloads).
 */
import type { ChatResponse } from '#uilib/types/chat-api.types';
export declare const MINIAPP_CHANNEL: "sybilion.miniapp";
export declare const MINIAPP_VERSION: 1;
export type ThemeSyncPayload = {
    mode: 'light' | 'dark';
    isDarkMode: boolean;
};
export type MiniAppMessageReady = {
    channel: typeof MINIAPP_CHANNEL;
    version: typeof MINIAPP_VERSION;
    type: 'READY';
    payload: Record<string, unknown> | {
        appId?: string;
    };
};
export type MiniAppMessageThemeSync = {
    channel: typeof MINIAPP_CHANNEL;
    version: typeof MINIAPP_VERSION;
    type: 'THEME_SYNC';
    payload: ThemeSyncPayload;
};
export type MiniAppDataOp = 'getDatasets' | 'getDataset' | 'getForecasts' | 'getForecast' | 'getDrivers' | 'getPerformanceData' | 'getDriversComparisonData';
export type MiniAppDataRequestPayload = {
    requestId: string;
    op: MiniAppDataOp;
    params?: Record<string, number>;
};
export type MiniAppMessageDataRequest = {
    channel: typeof MINIAPP_CHANNEL;
    version: typeof MINIAPP_VERSION;
    type: 'DATA_REQUEST';
    payload: MiniAppDataRequestPayload;
};
export type MiniAppDataResponsePayload = {
    requestId: string;
    ok: boolean;
    result?: unknown;
    error?: string;
};
export type MiniAppMessageDataResponse = {
    channel: typeof MINIAPP_CHANNEL;
    version: typeof MINIAPP_VERSION;
    type: 'DATA_RESPONSE';
    payload: MiniAppDataResponsePayload;
};
export type MiniAppChatSendPayload = {
    requestId: string;
    chatId: string;
    message: string;
};
export type MiniAppMessageChatSend = {
    channel: typeof MINIAPP_CHANNEL;
    version: typeof MINIAPP_VERSION;
    type: 'CHAT_SEND';
    payload: MiniAppChatSendPayload;
};
export type MiniAppChatSendResultPayload = {
    requestId: string;
    ok: true;
    result: ChatResponse;
} | {
    requestId: string;
    ok: false;
    error: string;
};
export type MiniAppMessageChatSendResult = {
    channel: typeof MINIAPP_CHANNEL;
    version: typeof MINIAPP_VERSION;
    type: 'CHAT_SEND_RESULT';
    payload: MiniAppChatSendResultPayload;
};
/** Parse parent → child THEME_SYNC (shell uses `buildThemeSyncMessage`). */
export declare function parseThemeSyncMessage(data: unknown): ThemeSyncPayload | null;
/** Child → parent READY (optional `appId` for telemetry). */
export declare function buildReadyMessage(payload?: Record<string, unknown>): MiniAppMessageReady;
export declare function resolveParentOriginFromReferrer(): string | null;
export declare function applyThemeToDocument(mode: 'light' | 'dark'): void;
/** Only accept shell messages that appear to come from the real embedding parent. */
export declare function isTrustedMiniAppParentMessage(event: MessageEvent): boolean;
export declare function buildDataRequestMessage(payload: MiniAppDataRequestPayload): MiniAppMessageDataRequest;
export declare function buildChatSendMessage(payload: MiniAppChatSendPayload): MiniAppMessageChatSend;
/** Parse parent → child DATA_RESPONSE. */
export declare function parseDataResponseMessage(data: unknown): MiniAppDataResponsePayload | null;
/** Parse parent → child CHAT_SEND_RESULT (shell uses `buildChatSendResultMessage`). */
export declare function parseChatSendResultMessage(data: unknown): MiniAppChatSendResultPayload | null;

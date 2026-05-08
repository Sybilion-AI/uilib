import type { ChatResponse } from '#uilib/types/chat-api.types';
/**
 * Ask the Sybilion host to send a chat message with its auth token.
 * Does not update host ChatSheet state — same session as `chatId` on the agent only.
 */
export declare function sendChatMessage(chatId: string, message: string): Promise<ChatResponse>;

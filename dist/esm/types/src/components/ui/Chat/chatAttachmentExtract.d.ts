import type { ChatAttachmentDropItem } from './Chat.types';
export declare function extractChatAttachmentItems(files: File[], allowPdfAttachments: boolean): Promise<ChatAttachmentDropItem[]>;

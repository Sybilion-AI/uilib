import type { ChatAttachmentDropItem } from './Chat.types';
import { isPdfFile } from './chatAttachmentAccept';
import { extractPdfFileToText } from './chatPdfExtract';

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () =>
      reject(reader.error ?? new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
}

export async function extractChatAttachmentItems(
  files: File[],
  allowPdfAttachments: boolean,
): Promise<ChatAttachmentDropItem[]> {
  const items = await Promise.all(
    files.map(async file => {
      if (isPdfFile(file)) {
        if (!allowPdfAttachments) return null;
        const text = await extractPdfFileToText(file);
        return { file, text, kind: 'pdf' as const };
      }

      const text = await readTextFile(file);
      return { file, text, kind: 'text' as const };
    }),
  );

  return items.filter((item): item is ChatAttachmentDropItem => item != null);
}

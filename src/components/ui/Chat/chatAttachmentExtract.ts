import type { ChatAttachmentDropItem } from './Chat.types';
import { isDocxFile, isPdfFile, isXlsxFile } from './chatAttachmentAccept';
import { extractDocxFileToText } from './chatDocxExtract';
import { extractPdfFileToText } from './chatPdfExtract';
import { extractXlsxFileToText } from './chatXlsxExtract';

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

      if (isDocxFile(file)) {
        const text = await extractDocxFileToText(file);
        return { file, text, kind: 'docx' as const };
      }

      if (isXlsxFile(file)) {
        const text = await extractXlsxFileToText(file);
        return { file, text, kind: 'xlsx' as const };
      }

      const text = await readTextFile(file);
      return { file, text, kind: 'text' as const };
    }),
  );

  return items.filter((item): item is ChatAttachmentDropItem => item != null);
}

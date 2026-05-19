import { isPdfFile } from './chatAttachmentAccept.js';
import { extractPdfFileToText } from './chatPdfExtract.js';

function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error ?? new Error(`Failed to read ${file.name}`));
        reader.readAsText(file);
    });
}
async function extractChatAttachmentItems(files, allowPdfAttachments) {
    const items = await Promise.all(files.map(async (file) => {
        if (isPdfFile(file)) {
            if (!allowPdfAttachments)
                return null;
            const text = await extractPdfFileToText(file);
            return { file, text, kind: 'pdf' };
        }
        const text = await readTextFile(file);
        return { file, text, kind: 'text' };
    }));
    return items.filter((item) => item != null);
}

export { extractChatAttachmentItems };

import { isPdfFile, isDocxFile, isXlsxFile } from './chatAttachmentAccept.js';
import { extractDocxFileToText } from './chatDocxExtract.js';
import { extractPdfFileToText } from './chatPdfExtract.js';
import { extractXlsxFileToText } from './chatXlsxExtract.js';

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
        if (isDocxFile(file)) {
            const text = await extractDocxFileToText(file);
            return { file, text, kind: 'docx' };
        }
        if (isXlsxFile(file)) {
            const text = await extractXlsxFileToText(file);
            return { file, text, kind: 'xlsx' };
        }
        const text = await readTextFile(file);
        return { file, text, kind: 'text' };
    }));
    return items.filter((item) => item != null);
}

export { extractChatAttachmentItems };

/** MIME types and extensions accepted for chat text attachments. */
const TEXT_ATTACHMENT_ACCEPT_PARTS = [
    'text/plain',
    '.txt',
    'text/csv',
    '.csv',
    'text/markdown',
    '.md',
    '.markdown',
    'application/json',
    '.json',
    'text/html',
    '.html',
    '.htm',
    'text/xml',
    'application/xml',
    '.xml',
    'text/yaml',
    'application/yaml',
    'application/x-yaml',
    '.yaml',
    '.yml',
    'text/tab-separated-values',
    '.tsv',
    'text/calendar',
    '.ics',
];
const PDF_ATTACHMENT_ACCEPT_PARTS = ['application/pdf', '.pdf'];
const TEXT_ATTACHMENT_ACCEPT_SET = new Set(TEXT_ATTACHMENT_ACCEPT_PARTS.map(part => part.toLowerCase()));
/** Keep only tokens from `parts` that appear in the text attachment allowlist. */
function filterToTextAttachments(parts) {
    if (!parts?.length)
        return [];
    return parts.filter(part => TEXT_ATTACHMENT_ACCEPT_SET.has(part.trim().toLowerCase()));
}
function buildAcceptAttr(filteredTextParts, allowPdf) {
    const parts = [...filteredTextParts];
    if (allowPdf) {
        parts.push(...PDF_ATTACHMENT_ACCEPT_PARTS);
    }
    return parts.join(',');
}
function isPdfFile(file) {
    const type = file.type.toLowerCase();
    if (type === 'application/pdf')
        return true;
    return file.name.toLowerCase().endsWith('.pdf');
}
function isAttachmentsDropzoneEnabled(allowedAttachments, allowPdfAttachments) {
    return (filterToTextAttachments(allowedAttachments).length > 0 ||
        Boolean(allowPdfAttachments));
}

export { PDF_ATTACHMENT_ACCEPT_PARTS, TEXT_ATTACHMENT_ACCEPT_PARTS, buildAcceptAttr, filterToTextAttachments, isAttachmentsDropzoneEnabled, isPdfFile };

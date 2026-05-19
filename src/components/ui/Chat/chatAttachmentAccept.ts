/** MIME types and extensions accepted for chat text attachments. */
export const TEXT_ATTACHMENT_ACCEPT_PARTS = [
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
] as const;

export const PDF_ATTACHMENT_ACCEPT_PARTS = ['application/pdf', '.pdf'] as const;

const TEXT_ATTACHMENT_ACCEPT_SET = new Set<string>(
  TEXT_ATTACHMENT_ACCEPT_PARTS.map(part => part.toLowerCase()),
);

/** Keep only tokens from `parts` that appear in the text attachment allowlist. */
export function filterToTextAttachments(
  parts: readonly string[] | undefined,
): string[] {
  if (!parts?.length) return [];
  return parts.filter(part =>
    TEXT_ATTACHMENT_ACCEPT_SET.has(part.trim().toLowerCase()),
  );
}

export function buildAcceptAttr(
  filteredTextParts: readonly string[],
  allowPdf: boolean,
): string {
  const parts = [...filteredTextParts];
  if (allowPdf) {
    parts.push(...PDF_ATTACHMENT_ACCEPT_PARTS);
  }
  return parts.join(',');
}

export function isPdfFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === 'application/pdf') return true;
  return file.name.toLowerCase().endsWith('.pdf');
}

export function isAttachmentsDropzoneEnabled(
  allowedAttachments: readonly string[] | undefined,
  allowPdfAttachments: boolean | undefined,
): boolean {
  return (
    filterToTextAttachments(allowedAttachments).length > 0 ||
    Boolean(allowPdfAttachments)
  );
}

/** MIME types and extensions accepted for chat text attachments. */
export declare const TEXT_ATTACHMENT_ACCEPT_PARTS: readonly ["text/plain", ".txt", "text/csv", ".csv", "text/markdown", ".md", ".markdown", "application/json", ".json", "text/html", ".html", ".htm", "text/xml", "application/xml", ".xml", "text/yaml", "application/yaml", "application/x-yaml", ".yaml", ".yml", "text/tab-separated-values", ".tsv", "text/calendar", ".ics"];
export declare const PDF_ATTACHMENT_ACCEPT_PARTS: readonly ["application/pdf", ".pdf"];
/** Keep only tokens from `parts` that appear in the text attachment allowlist. */
export declare function filterToTextAttachments(parts: readonly string[] | undefined): string[];
export declare function buildAcceptAttr(filteredTextParts: readonly string[], allowPdf: boolean): string;
export declare function isPdfFile(file: File): boolean;
export declare function isAttachmentsDropzoneEnabled(allowedAttachments: readonly string[] | undefined, allowPdfAttachments: boolean | undefined): boolean;

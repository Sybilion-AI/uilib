/** Best-effort plain text from XLSX; one CSV block per sheet (xlsx loaded on demand). */
export declare function extractXlsxFileToText(file: File): Promise<string>;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_SHEETS = 20;
const MAX_CSV_CHARS_PER_SHEET = 500_000;
function truncateCsv(csv) {
    if (csv.length <= MAX_CSV_CHARS_PER_SHEET)
        return csv;
    return `${csv.slice(0, MAX_CSV_CHARS_PER_SHEET).trimEnd()}…`;
}
/** Best-effort plain text from XLSX; one CSV block per sheet (xlsx loaded on demand). */
async function extractXlsxFileToText(file) {
    const buffer = new Uint8Array(await file.arrayBuffer());
    if (buffer.byteLength > MAX_FILE_BYTES) {
        throw new Error(`${file.name} is too large (max ${MAX_FILE_BYTES / (1024 * 1024)} MB)`);
    }
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetNames = workbook.SheetNames.slice(0, MAX_SHEETS);
    const sheetTexts = [];
    for (const sheetName of sheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet)
            continue;
        const csv = truncateCsv(XLSX.utils.sheet_to_csv(sheet, { blankrows: false }).trim());
        if (csv) {
            sheetTexts.push(`## Sheet ${sheetName}\n\n${csv}`);
        }
    }
    if (workbook.SheetNames.length > MAX_SHEETS) {
        sheetTexts.push(`_(Only the first ${MAX_SHEETS} of ${workbook.SheetNames.length} sheets were included.)_`);
    }
    return sheetTexts.join('\n\n');
}

export { extractXlsxFileToText };

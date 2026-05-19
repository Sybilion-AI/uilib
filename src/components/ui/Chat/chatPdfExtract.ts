let workerConfigured = false;

async function configurePdfWorker(
  pdfjs: typeof import('pdfjs-dist/legacy/build/pdf.mjs'),
): Promise<void> {
  if (workerConfigured) return;

  const version = pdfjs.version ?? '4.10.38';
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/legacy/build/pdf.worker.min.mjs`;
  workerConfigured = true;
}

/** Best-effort plain text from PDF; pages separated with lightweight markdown headings. */
export async function extractPdfFileToText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  await configurePdfWorker(pdfjs);

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      pageTexts.push(`## Page ${pageNumber}\n\n${pageText}`);
    }
  }

  return pageTexts.join('\n\n');
}

/** Best-effort plain text from DOCX via mammoth (loaded on demand). */
export async function extractDocxFileToText(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });

  const errors = result.messages.filter(m => m.type === 'error');
  if (errors.length > 0) {
    const detail = errors.map(m => m.message).join('; ');
    throw new Error(
      detail
        ? `Failed to read ${file.name}: ${detail}`
        : `Failed to read ${file.name}`,
    );
  }

  return result.value.trim();
}

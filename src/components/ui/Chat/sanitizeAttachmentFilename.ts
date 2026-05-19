/** Safe download filename from a display title or original file name. */
export function sanitizeAttachmentFilename(
  displayTitle: string,
  defaultExt = 'txt',
): string {
  const cleaned = displayTitle
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  const base = cleaned.length > 0 ? cleaned : 'attachment';
  const ext = defaultExt.startsWith('.') ? defaultExt : `.${defaultExt}`;
  const pattern = new RegExp(`${ext.replace('.', '\\.')}$`, 'i');
  return pattern.test(base) ? base : `${base}${ext}`;
}

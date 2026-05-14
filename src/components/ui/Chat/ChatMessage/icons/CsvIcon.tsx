import { FileSpreadsheet } from 'lucide-react';

export function CsvIcon({ size = 32 }: { size?: number }) {
  return (
    <FileSpreadsheet size={size} aria-hidden strokeWidth={1.75} color="currentColor" />
  );
}

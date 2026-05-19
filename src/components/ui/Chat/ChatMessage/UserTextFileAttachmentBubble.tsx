import { FileChip, type FileChipFormat } from '#uilib/components/ui/FileChip';
import { downloadTextFile } from '#uilib/utils/downloadTextFile';

import type { UserTextFileAttachment } from '../Chat.types';

function formatFromFilename(filename: string): FileChipFormat {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'text';
}

function mimeForFormat(format: FileChipFormat): string {
  if (format === 'csv') return 'text/csv;charset=utf-8';
  if (format === 'pdf') return 'application/pdf';
  return 'text/plain;charset=utf-8';
}

function hintForFormat(format: FileChipFormat): string {
  if (format === 'csv') return 'Download .CSV file';
  if (format === 'pdf') return 'Download file';
  return 'Download text file';
}

export function UserTextFileAttachmentBubble({
  attachment,
}: {
  attachment: UserTextFileAttachment;
}) {
  const format = formatFromFilename(attachment.filename);

  return (
    <FileChip
      name={attachment.displayName}
      format={format}
      hint={hintForFormat(format)}
      onClick={() =>
        downloadTextFile(
          attachment.content,
          attachment.filename,
          mimeForFormat(format),
        )
      }
    />
  );
}

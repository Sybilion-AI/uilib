import { FileChip } from '#uilib/components/ui/FileChip';
import { downloadTextFile } from '#uilib/utils/downloadTextFile';

import type { UserCsvAttachment } from '../Chat.types';

const CSV_DOWNLOAD_HINT = 'Download .CSV file';

export function UserCsvAttachmentBubble({
  attachment,
}: {
  attachment: UserCsvAttachment;
}) {
  return (
    <FileChip
      name={attachment.displayName}
      format="csv"
      hint={CSV_DOWNLOAD_HINT}
      onClick={() =>
        downloadTextFile(
          attachment.content,
          attachment.filename,
          'text/csv;charset=utf-8',
        )
      }
    />
  );
}

import { downloadTextFile } from '#uilib/utils/downloadTextFile';

import { CsvIcon } from '../../../icons/CsvIcon/CsvIcon';
import type { UserCsvAttachment } from '../Chat.types';
import S from './ChatMessage.styl';

const CSV_DOWNLOAD_HINT = 'Download .CSV file';

export function UserCsvAttachmentBubble({
  attachment,
}: {
  attachment: UserCsvAttachment;
}) {
  return (
    <button
      type="button"
      className={S.userCsvCard}
      aria-label={`${CSV_DOWNLOAD_HINT}: ${attachment.displayName}`}
      onClick={() =>
        downloadTextFile(
          attachment.content,
          attachment.filename,
          'text/csv;charset=utf-8',
        )
      }
    >
      <div className={S.userCsvCardIcon}>
        <CsvIcon size={32} />
      </div>
      <div className={S.userCsvCardContent}>
        <div className={S.userCsvCardTitle}>{attachment.displayName}</div>
        <div className={S.userCsvCardSubtitle}>{CSV_DOWNLOAD_HINT}</div>
      </div>
    </button>
  );
}

import { jsx } from 'react/jsx-runtime';
import { FileChip } from '../../FileChip/FileChip.js';
import { downloadTextFile } from '../../../../utils/downloadTextFile.js';

const CSV_DOWNLOAD_HINT = 'Download .CSV file';
function UserCsvAttachmentBubble({ attachment, }) {
    return (jsx(FileChip, { name: attachment.displayName, format: "csv", hint: CSV_DOWNLOAD_HINT, onClick: () => downloadTextFile(attachment.content, attachment.filename, 'text/csv;charset=utf-8') }));
}

export { UserCsvAttachmentBubble };

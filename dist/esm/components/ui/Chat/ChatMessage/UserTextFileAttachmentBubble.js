import { jsx } from 'react/jsx-runtime';
import { FileChip } from '../../FileChip/FileChip.js';
import { downloadTextFile } from '../../../../utils/downloadTextFile.js';

function formatFromFilename(filename) {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.csv'))
        return 'csv';
    if (lower.endsWith('.pdf'))
        return 'pdf';
    return 'text';
}
function mimeForFormat(format) {
    if (format === 'csv')
        return 'text/csv;charset=utf-8';
    if (format === 'pdf')
        return 'application/pdf';
    return 'text/plain;charset=utf-8';
}
function hintForFormat(format) {
    if (format === 'csv')
        return 'Download .CSV file';
    if (format === 'pdf')
        return 'Download file';
    return 'Download text file';
}
function UserTextFileAttachmentBubble({ attachment, }) {
    const format = formatFromFilename(attachment.filename);
    return (jsx(FileChip, { name: attachment.displayName, format: format, hint: hintForFormat(format), onClick: () => downloadTextFile(attachment.content, attachment.filename, mimeForFormat(format)) }));
}

export { UserTextFileAttachmentBubble };

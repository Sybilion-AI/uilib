import { jsxs, jsx } from 'react/jsx-runtime';
import { downloadTextFile } from '../../../../utils/downloadTextFile.js';
import { CsvIcon } from './icons/CsvIcon.js';
import S from './ChatMessage.styl.js';

const CSV_DOWNLOAD_HINT = 'Download .CSV file';
function UserCsvAttachmentBubble({ attachment, }) {
    return (jsxs("button", { type: "button", className: S.userCsvCard, "aria-label": `${CSV_DOWNLOAD_HINT}: ${attachment.displayName}`, onClick: () => downloadTextFile(attachment.content, attachment.filename, 'text/csv;charset=utf-8'), children: [jsx("div", { className: S.userCsvCardIcon, children: jsx(CsvIcon, { size: 32 }) }), jsxs("div", { className: S.userCsvCardContent, children: [jsx("div", { className: S.userCsvCardTitle, children: attachment.displayName }), jsx("div", { className: S.userCsvCardSubtitle, children: CSV_DOWNLOAD_HINT })] })] }));
}

export { UserCsvAttachmentBubble };

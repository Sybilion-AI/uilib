import { jsx } from 'react/jsx-runtime';
import { FileChip } from '../../FileChip/FileChip.js';
import S from './ChatPrompt.styl.js';

function ChatPromptAttachments({ attachments, onRemove, disabled = false, }) {
    if (attachments.length === 0)
        return null;
    return (jsx("div", { className: S.attachments, children: attachments.map((item, index) => (jsx(FileChip, { className: S.attachmentItem, name: item.file.name, format: item.kind === 'pdf' ? 'pdf' : 'text', hint: item.kind === 'pdf' ? 'PDF' : 'Text file', onRemove: () => onRemove(index), disabled: disabled }, `${item.file.name}-${index}`))) }));
}

export { ChatPromptAttachments };

import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
import { Button } from '../../Button/Button.js';
import { InteractiveContent } from '../../InteractiveContent/InteractiveContent.js';
import { Presentation } from 'lucide-react';
import '../../InteractiveContent/InteractiveContent.styl.js';
import { parseDatasetAppToken } from '../../../../utils/datasetApplicationLink.js';
import { Scroll } from '@homecode/ui';
import { PaperPlaneRightIcon } from '@phosphor-icons/react';
import { convertMarkdownTableToHTML } from './AgentMessageContent.helpers.js';
import { ChatDatasetApplicationLink } from './ChatDatasetApplicationLink.js';
import S from './ChatMessage.styl.js';
import { DocIcon } from './icons/DocIcon.js';
import { XlsIcon } from './icons/XlsIcon.js';

function AgentMessageContent({ text, onQuickReply, suppressedQuickReplyKeys, quickReplyDisabled, isLastMessage = true, scriptContinue, onScriptContinue, renderMessageChart, }) {
    const [showRaw, setShowRaw] = useState(false);
    const parts = useMemo(() => {
        // Convert markdown tables to HTML first
        const textWithHTMLTables = convertMarkdownTableToHTML(text);
        const result = [];
        let lastIndex = 0;
        let previousWasDownload = false;
        const combinedRegex = /(?:<table[^>]*>[\s\S]*?<\/table>|<ul[^>]*>[\s\S]*?<\/ul>|<ol[^>]*>[\s\S]*?<\/ol>|\[CHART\]|\[DOWNLOAD_BUTTONS\]|\[DOWNLOAD:([^\]]+)\]|\[datasetId:\d+(?:;analysisId:\d+)?\]|\[(?!CHART\]|DOWNLOAD_BUTTONS\]|DOWNLOAD:)([^\]]+)\](?!\())/gi;
        let match;
        while ((match = combinedRegex.exec(textWithHTMLTables)) !== null) {
            // Add non-match part before this match
            if (match.index > lastIndex) {
                let nonMatchPart = textWithHTMLTables.slice(lastIndex, match.index);
                if (match[0].startsWith('<table') && /\n\|\s*$/.test(nonMatchPart)) {
                    nonMatchPart = nonMatchPart.replace(/\n\|\s*$/, '\n');
                }
                const currentIsDownload = match[0].startsWith('[DOWNLOAD:');
                // Skip formatting for very short text between download markers (like "-")
                // to avoid unwanted line breaks
                if (previousWasDownload &&
                    currentIsDownload &&
                    nonMatchPart.trim().length <= 5) ;
                else {
                    result.push(jsx(InteractiveContent, { text: nonMatchPart }));
                }
            }
            // Check if it's a table, list, [CHART], [DOWNLOAD_BUTTONS], or [DOWNLOAD:filename]
            if (match[0].startsWith('<table')) {
                // Add table wrapped in Scroll
                result.push(jsx(Scroll, { x: true, size: "s", className: S.scrollHorizontal, children: jsx("div", { dangerouslySetInnerHTML: { __html: match[0] } }) }, `table-${match.index}`));
            }
            else if (match[0].startsWith('<ul') || match[0].startsWith('<ol')) {
                // Add HTML list
                result.push(jsx("div", { dangerouslySetInnerHTML: { __html: match[0] } }, `list-${match.index}`));
            }
            else if (match[0] === '[CHART]') {
                const chart = renderMessageChart?.();
                if (chart != null) {
                    result.push(jsx("span", { children: chart }, `chart-${match.index}`));
                }
            }
            else if (match[0].startsWith('[DOWNLOAD:')) {
                // Parse filename from [DOWNLOAD:filename] format
                // Extract filename from the full match string or use match[2] if available
                const fullMatch = match[0];
                const filenameMatch = fullMatch.match(/\[DOWNLOAD:\s*([^\]]+)\]/i);
                const filename = (filenameMatch?.[1] || match[1] || '').trim();
                const extension = filename.split('.').pop()?.toLowerCase() || '';
                const filenameWithoutExt = filename.replace(/\.[^.]+$/, '');
                // Determine file type and icon
                const isDoc = extension === 'doc' || extension === 'docx';
                const isXls = extension === 'xls' || extension === 'xlsx';
                const isPpt = extension === 'ppt' || extension === 'pptx';
                // Only render if it's a recognized file type
                if (isDoc || isXls || isPpt) {
                    let Icon, fileTypeLabel;
                    if (isDoc) {
                        Icon = DocIcon;
                        fileTypeLabel = 'DOC';
                    }
                    else if (isXls) {
                        Icon = XlsIcon;
                        fileTypeLabel = 'XLS';
                    }
                    else if (isPpt) {
                        Icon = Presentation;
                        fileTypeLabel = 'PPT';
                    }
                    result.push(jsxs("div", { className: S.downloadCard, children: [jsx("div", { className: S.downloadCardIcon, children: jsx(Icon, { size: 32 }) }), jsxs("div", { className: S.downloadCardContent, children: [jsx("div", { className: S.downloadCardTitle, children: filenameWithoutExt }), jsxs("div", { className: S.downloadCardSubtitle, children: ["Download .", fileTypeLabel, " file"] })] })] }, `download-${match.index}`));
                }
            }
            else if (match[0].startsWith('[datasetId:')) {
                const parsed = parseDatasetAppToken(match[0]);
                if (parsed) {
                    result.push(jsx(ChatDatasetApplicationLink, { datasetId: parsed.datasetId, analysisId: parsed.analysisId }, `dataset-app-${match.index}`));
                }
            }
            else if (isLastMessage && match[2] != null && match[2] !== '') {
                const inner = match[2].trim();
                const pipeIdx = inner.indexOf('|');
                const displayLabel = pipeIdx >= 0 ? inner.slice(0, pipeIdx).trim() : inner;
                const branchKey = pipeIdx >= 0 ? inner.slice(pipeIdx + 1).trim() : inner;
                if (branchKey && displayLabel) {
                    const suppressed = suppressedQuickReplyKeys?.has(branchKey);
                    if (!suppressed && onQuickReply) {
                        result.push(jsx("span", { className: S.quickReplyWrap, children: jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: quickReplyDisabled, onClick: () => onQuickReply(branchKey, displayLabel), children: [jsx(PaperPlaneRightIcon, {}), displayLabel] }) }, `quick-${match.index}`));
                    }
                    else if (!suppressed) {
                        result.push(jsx("span", { children: displayLabel }, `quick-${match.index}`));
                    }
                }
            }
            // Track if current match is a download marker for next iteration
            previousWasDownload = match[0].startsWith('[DOWNLOAD:');
            lastIndex = match.index + match[0].length;
        }
        // Add remaining non-match part
        if (lastIndex < textWithHTMLTables.length) {
            const nonMatchPart = textWithHTMLTables.slice(lastIndex);
            result.push(jsx("div", { children: jsx(InteractiveContent, { text: nonMatchPart }) }, `text-${lastIndex}`));
        }
        return result;
    }, [
        text,
        onQuickReply,
        suppressedQuickReplyKeys,
        quickReplyDisabled,
        isLastMessage,
        renderMessageChart,
    ]);
    return (jsxs("div", { className: S.text, children: [showRaw ? text : parts, !showRaw &&
                isLastMessage &&
                scriptContinue &&
                onScriptContinue &&
                scriptContinue.label && (jsx("span", { className: S.quickReplyWrap, children: jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: quickReplyDisabled, onClick: () => onScriptContinue(), children: [jsx(PaperPlaneRightIcon, {}), scriptContinue.label] }) }))] }));
}

export { AgentMessageContent };

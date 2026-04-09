import { useMemo, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { InteractiveContent } from '@/components/ui/InteractiveContent';
import { parseDatasetAppToken } from '@/utils/datasetApplicationLink';
import { Scroll } from '@homecode/ui';
import { PaperPlaneRightIcon } from '@phosphor-icons/react';
import { Presentation } from 'lucide-react';

import { convertMarkdownTableToHTML } from './AgentMessageContent.helpers';
import { ChatDatasetApplicationLink } from './ChatDatasetApplicationLink';
import S from './ChatMessage.styl';
import { DocIcon } from './icons/DocIcon';
import { XlsIcon } from './icons/XlsIcon';

export function AgentMessageContent({
  text,
  onQuickReply,
  suppressedQuickReplyKeys,
  quickReplyDisabled,
  isLastMessage = true,
  scriptContinue,
  onScriptContinue,
  renderMessageChart,
}: {
  text: string;
  onQuickReply?: (branchKey: string, displayLabel: string) => void;
  suppressedQuickReplyKeys?: ReadonlySet<string>;
  quickReplyDisabled?: boolean;
  isLastMessage?: boolean;
  scriptContinue?: { label: string };
  onScriptContinue?: () => void;
  renderMessageChart?: () => ReactNode;
}) {
  const [showRaw, setShowRaw] = useState(false);

  const parts = useMemo(() => {
    // Convert markdown tables to HTML first
    const textWithHTMLTables = convertMarkdownTableToHTML(text);

    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    let previousWasDownload = false;
    const combinedRegex =
      /(?:<table[^>]*>[\s\S]*?<\/table>|<ul[^>]*>[\s\S]*?<\/ul>|<ol[^>]*>[\s\S]*?<\/ol>|\[CHART\]|\[DOWNLOAD_BUTTONS\]|\[DOWNLOAD:([^\]]+)\]|\[datasetId:\d+(?:;analysisId:\d+)?\]|\[(?!CHART\]|DOWNLOAD_BUTTONS\]|DOWNLOAD:)([^\]]+)\](?!\())/gi;
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
        if (
          previousWasDownload &&
          currentIsDownload &&
          nonMatchPart.trim().length <= 5
        ) {
          // Skip rendering short separators between download buttons
          // This prevents "-" or similar characters from creating <br> tags
        } else {
          result.push(<InteractiveContent text={nonMatchPart} />);
        }
      }

      // Check if it's a table, list, [CHART], [DOWNLOAD_BUTTONS], or [DOWNLOAD:filename]
      if (match[0].startsWith('<table')) {
        // Add table wrapped in Scroll
        result.push(
          <Scroll
            key={`table-${match.index}`}
            x
            size="s"
            className={S.scrollHorizontal}
          >
            <div dangerouslySetInnerHTML={{ __html: match[0] }} />
          </Scroll>,
        );
      } else if (match[0].startsWith('<ul') || match[0].startsWith('<ol')) {
        // Add HTML list
        result.push(
          <div
            key={`list-${match.index}`}
            dangerouslySetInnerHTML={{ __html: match[0] }}
          />,
        );
      } else if (match[0] === '[CHART]') {
        const chart = renderMessageChart?.();
        if (chart != null) {
          result.push(<span key={`chart-${match.index}`}>{chart}</span>);
        }
      } else if (match[0].startsWith('[DOWNLOAD:')) {
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
          } else if (isXls) {
            Icon = XlsIcon;
            fileTypeLabel = 'XLS';
          } else if (isPpt) {
            Icon = Presentation;
            fileTypeLabel = 'PPT';
          }

          result.push(
            <div key={`download-${match.index}`} className={S.downloadCard}>
              <div className={S.downloadCardIcon}>
                <Icon size={32} />
              </div>
              <div className={S.downloadCardContent}>
                <div className={S.downloadCardTitle}>{filenameWithoutExt}</div>
                <div className={S.downloadCardSubtitle}>
                  Download .{fileTypeLabel} file
                </div>
              </div>
            </div>,
          );
        }
      } else if (match[0].startsWith('[datasetId:')) {
        const parsed = parseDatasetAppToken(match[0]);
        if (parsed) {
          result.push(
            <ChatDatasetApplicationLink
              key={`dataset-app-${match.index}`}
              datasetId={parsed.datasetId}
              analysisId={parsed.analysisId}
            />,
          );
        }
      } else if (isLastMessage && match[2] != null && match[2] !== '') {
        const inner = match[2].trim();
        const pipeIdx = inner.indexOf('|');
        const displayLabel =
          pipeIdx >= 0 ? inner.slice(0, pipeIdx).trim() : inner;
        const branchKey =
          pipeIdx >= 0 ? inner.slice(pipeIdx + 1).trim() : inner;
        if (branchKey && displayLabel) {
          const suppressed = suppressedQuickReplyKeys?.has(branchKey);
          if (!suppressed && onQuickReply) {
            result.push(
              <span key={`quick-${match.index}`} className={S.quickReplyWrap}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={quickReplyDisabled}
                  onClick={() => onQuickReply(branchKey, displayLabel)}
                >
                  <PaperPlaneRightIcon />
                  {displayLabel}
                </Button>
              </span>,
            );
          } else if (!suppressed) {
            result.push(
              <span key={`quick-${match.index}`}>{displayLabel}</span>,
            );
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
      result.push(
        <div key={`text-${lastIndex}`}>
          <InteractiveContent text={nonMatchPart} />
        </div>,
      );
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

  return (
    <div
      className={S.text}
      // onClick={() => setShowRaw(!showRaw)}
    >
      {showRaw ? text : parts}
      {!showRaw &&
        isLastMessage &&
        scriptContinue &&
        onScriptContinue &&
        scriptContinue.label && (
          <span className={S.quickReplyWrap}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={quickReplyDisabled}
              onClick={() => onScriptContinue()}
            >
              <PaperPlaneRightIcon />
              {scriptContinue.label}
            </Button>
          </span>
        )}
    </div>
  );
}

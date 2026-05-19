import cn from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  displayLabelForBranchKeyFromMessages,
  humanizeBranchKey,
} from '#uilib/components/ui/Chat/ChatMessage/presetScript';
import { TextShimmer } from '#uilib/components/ui/TextShimmer';
import { Scroll } from '@homecode/ui';
import { ChartLineIcon, PaperPlaneRightIcon, X } from '@phosphor-icons/react';

import { Button } from '../../Button';
import { DropZone } from '../../DropZone/DropZone';
import { PanelResizeHandle } from '../../Sidebar/Sidebar';
import SidebarStem from '../../Sidebar/Sidebar.styl';
import { Chat } from '../Chat';
import type { ChatAttachmentDropItem } from '../Chat.types';
import {
  buildAcceptAttr,
  filterToTextAttachments,
  isAttachmentsDropzoneEnabled,
} from '../chatAttachmentAccept';
import { extractChatAttachmentItems } from '../chatAttachmentExtract';
import S from './ChatChrome.styl';
import type { ChatChromeProps } from './ChatChrome.types';

export function ChatChrome({
  showResizeHandle,
  resizeHandle,
  onClose,
  isEmpty,
  renderPresets,
  messages,
  onQuickReply,
  suppressedQuickReplyKeys,
  isLoading,
  scriptContinueLabel,
  onScriptContinue,
  renderMessageChart,
  showBranchActionsRow,
  showSyntheticBranchButtons,
  unusedBranchKeys,
  isScriptComplete,
  onGenerateDashboard,
  generatingDashboard,
  onGenerateDashboardClick,
  showInlinePresets,
  isLastMessageFromUser,
  scrollRef,
  effectiveScopeId,
  onPromptSubmit,
  onChatDeleted,
  promptPrefill,
  footerClassName,
  emptyState,
  allowedAttachments,
  allowPdfAttachments = false,
  onAttachmentsDropped,
}: ChatChromeProps) {
  const filteredAllowedAttachments = useMemo(
    () => filterToTextAttachments(allowedAttachments),
    [allowedAttachments],
  );
  const attachmentsDropzoneEnabled = isAttachmentsDropzoneEnabled(
    allowedAttachments,
    allowPdfAttachments,
  );
  const attachmentAccept = useMemo(
    () => buildAcceptAttr(filteredAllowedAttachments, allowPdfAttachments),
    [filteredAllowedAttachments, allowPdfAttachments],
  );
  const [pendingAttachments, setPendingAttachments] = useState<
    ChatAttachmentDropItem[]
  >([]);
  const [isExtractingAttachments, setIsExtractingAttachments] = useState(false);
  const promptBusy = isLoading || isExtractingAttachments;

  const handleAttachmentFiles = useCallback(
    (files: File[]) => {
      if (promptBusy || files.length === 0) return;

      setIsExtractingAttachments(true);
      void extractChatAttachmentItems(files, allowPdfAttachments)
        .then(items => {
          if (items.length > 0) {
            setPendingAttachments(prev => [...prev, ...items]);
          }
        })
        .finally(() => setIsExtractingAttachments(false));
    },
    [allowPdfAttachments, promptBusy],
  );

  const handleRemoveAttachment = useCallback((index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handlePromptSubmitWithAttachments = useCallback(
    (message: string, submittedAttachments?: ChatAttachmentDropItem[]) => {
      const trimmed = message.trim();
      const attachments = submittedAttachments ?? [];
      if (!trimmed && attachments.length === 0) return;

      void onPromptSubmit(trimmed, attachments);

      if (attachments.length > 0 && onAttachmentsDropped) {
        void onAttachmentsDropped(attachments);
      }

      setPendingAttachments([]);
    },
    [onAttachmentsDropped, onPromptSubmit],
  );

  useEffect(() => {
    if (isEmpty) return;

    const scrollToBottom = () => {
      const inner = scrollRef.current?.innerElem as HTMLDivElement | undefined;
      if (inner) {
        inner.scrollTo({
          top: inner.scrollHeight + 1000,
          behavior: 'smooth',
        });
      }
    };

    const inner = scrollRef.current?.innerElem as HTMLDivElement | undefined;
    if (inner) setTimeout(scrollToBottom, 100);
  }, [isEmpty, messages.length]);

  return (
    <div className={S.root}>
      {showResizeHandle && resizeHandle ? (
        <PanelResizeHandle
          edge="leading"
          isActive={resizeHandle.isActive}
          startWidthPx={resizeHandle.startWidthPx}
          getShellWidth={resizeHandle.getShellWidth}
          onDragWidth={resizeHandle.onDragWidth}
          onDragComplete={resizeHandle.onDragComplete}
          className={cn(SidebarStem.sidebarResizeHandle, S.chatResizeHandle)}
        />
      ) : null}
      <div className={S.panelHeader}>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            icon
            className={S.panelClose}
            aria-label="Close chat"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
      <div className={S.content}>
        {attachmentsDropzoneEnabled ? (
          <DropZone
            accept={attachmentAccept}
            label="Drop text files to attach"
            multiple
            ghost
            overlayScope="container"
            disabled={promptBusy}
            className={S.attachmentDropzone}
            onFiles={handleAttachmentFiles}
          />
        ) : null}
        <Chat
          isEmpty={isEmpty}
          scopeId={effectiveScopeId}
          onChatDeleted={onChatDeleted}
        >
          {isEmpty ? (
            <>
              <Chat.EmptyState {...emptyState} />
              {renderPresets('fixed')}
            </>
          ) : (
            <div className={S.scrollWrapper}>
              <Scroll
                y
                yScrollbarClassName={S.scrollbar}
                className={S.scroll}
                innerClassName={S.scrollInner}
                offset={{ y: { before: 56, after: 180 } }}
                fadeSize="m"
                autoHide
                ref={scrollRef}
              >
                {messages.map((msg, index, arr) => {
                  const isLast = index === arr.length - 1;
                  return (
                    <Chat.Message
                      key={msg.id}
                      role={msg.role}
                      text={msg.text}
                      userCsvAttachment={msg.userCsvAttachment}
                      onQuickReply={onQuickReply}
                      suppressedQuickReplyKeys={suppressedQuickReplyKeys}
                      quickReplyDisabled={isLoading}
                      isLastMessage={isLast}
                      scriptContinue={
                        isLast && scriptContinueLabel
                          ? { label: scriptContinueLabel }
                          : undefined
                      }
                      onScriptContinue={
                        isLast && scriptContinueLabel
                          ? onScriptContinue
                          : undefined
                      }
                      renderMessageChart={renderMessageChart}
                    />
                  );
                })}

                {showBranchActionsRow && (
                  <div className={S.branchRow}>
                    {showSyntheticBranchButtons
                      ? unusedBranchKeys.map(key => {
                          const label =
                            displayLabelForBranchKeyFromMessages(
                              key,
                              messages,
                            ) ?? humanizeBranchKey(key);
                          return (
                            <span key={key} className={S.branchBtnWrap}>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                onClick={() => onQuickReply(key, label)}
                              >
                                <PaperPlaneRightIcon />
                                {label}
                              </Button>
                            </span>
                          );
                        })
                      : null}

                    {isScriptComplete &&
                    onGenerateDashboard &&
                    !generatingDashboard ? (
                      <Button
                        type="button"
                        variant="default"
                        size="lg"
                        disabled={isLoading}
                        onClick={onGenerateDashboardClick}
                      >
                        <ChartLineIcon />
                        Generate Dashboard
                      </Button>
                    ) : null}
                  </div>
                )}

                {showInlinePresets && renderPresets('inline')}

                {isLoading && isLastMessageFromUser && (
                  <TextShimmer duration={1} spread={5} className={S.loader}>
                    Thinking...
                  </TextShimmer>
                )}
              </Scroll>
            </div>
          )}

          <div className={cn(S.footer, footerClassName)}>
            {isEmpty ? (
              <div className={S.notice}>
                Forecast Assistant can make mistakes.
              </div>
            ) : null}
            <Chat.Prompt
              onSubmit={handlePromptSubmitWithAttachments}
              disabled={promptBusy}
              attachments={pendingAttachments}
              onRemoveAttachment={handleRemoveAttachment}
              prefillMessage={promptPrefill ?? undefined}
            />
          </div>
        </Chat>
      </div>
    </div>
  );
}

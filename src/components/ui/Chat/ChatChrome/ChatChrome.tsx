import cn from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  displayLabelForBranchKeyFromMessages,
  humanizeBranchKey,
} from '#uilib/components/ui/Chat/ChatMessage/presetScript';
import { TextShimmer } from '#uilib/components/ui/TextShimmer';
import { Scroll } from '@homecode/ui';
import { PaperPlaneRightIcon, X } from '@phosphor-icons/react';

import { Button } from '../../Button';
import { DropZone } from '../../DropZone/DropZone';
import { PanelResizeHandle } from '../../Sidebar/Sidebar';
import SidebarStem from '../../Sidebar/Sidebar.styl';
import { Chat } from '../Chat';
import { type ChatAttachmentDropItem, MessageRole } from '../Chat.types';
import {
  buildAcceptAttr,
  filterToTextAttachments,
  isAttachmentsDropzoneEnabled,
} from '../chatAttachmentAccept';
import { extractChatAttachmentItems } from '../chatAttachmentExtract';
import S from './ChatChrome.styl';
import type { ChatChromeProps } from './ChatChrome.types';

export function ChatChrome({
  variant = 'default',
  showResizeHandle,
  resizeHandle,
  onClose,
  isEmpty,
  renderPresets,
  messages,
  onQuickReply,
  suppressedQuickReplyKeys,
  isLoading,
  loadingLabel,
  scriptContinueLabel,
  onScriptContinue,
  renderMessageChart,
  renderSystemMessage,
  showSyntheticBranchButtons,
  unusedBranchKeys,
  showInlinePresets,
  isLastMessageFromUser,
  scrollRef,
  effectiveScopeId,
  onPromptSubmit,
  onChatDeleted,
  onNewChat,
  promptPrefill,
  footerClassName,
  emptyState,
  allowedAttachments,
  allowPdfAttachments = false,
  onAttachmentsDropped,
  slashCommandItems,
  onSlashItemCommand,
  promptPlaceholder,
  hideChatSelector = false,
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
  const promptDisabled = isExtractingAttachments;
  const hasInProgressSystemMessage = useMemo(
    () =>
      messages.some(
        msg => msg.role === MessageRole.SYSTEM && msg.inProgress === true,
      ),
    [messages],
  );

  const handleAttachmentFiles = useCallback(
    (files: File[]) => {
      if (promptDisabled || files.length === 0) return;

      setIsExtractingAttachments(true);
      void extractChatAttachmentItems(files, allowPdfAttachments)
        .then(items => {
          if (items.length > 0) {
            setPendingAttachments(prev => [...prev, ...items]);
          }
        })
        .catch(() => {
          // Extraction failed (parse error, size limit, etc.); skip staging.
        })
        .finally(() => setIsExtractingAttachments(false));
    },
    [allowPdfAttachments, promptDisabled],
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

    const scrollToBottom = (behavior: ScrollBehavior) => {
      const inner = scrollRef.current?.innerElem as HTMLDivElement | undefined;
      if (!inner) return;
      inner.scrollTo({
        top: inner.scrollHeight + 1000,
        behavior,
      });
    };

    const behavior: ScrollBehavior = loadingLabel ? 'instant' : 'smooth';
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToBottom(behavior));
    });

    return () => cancelAnimationFrame(frameId);
  }, [
    isEmpty,
    messages.length,
    loadingLabel,
    showInlinePresets,
    showSyntheticBranchButtons,
  ]);

  const isClean = variant === 'clean';

  return (
    <div className={cn(S.root, isClean && S.rootClean)}>
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
            disabled={promptDisabled}
            className={S.attachmentDropzone}
            onFiles={handleAttachmentFiles}
          />
        ) : null}
        <Chat
          className={isClean ? S.chatClean : undefined}
          isEmpty={isEmpty}
          scopeId={effectiveScopeId}
          onChatDeleted={onChatDeleted}
          onNewChat={onNewChat}
          hideChatSelector={hideChatSelector}
        >
          {isEmpty ? (
            <div className={S.emptyBody}>
              <Chat.EmptyState {...emptyState} />
            </div>
          ) : (
            <div className={S.scrollWrapper}>
              <Scroll
                y
                yScrollbarClassName={S.scrollbar}
                className={S.scroll}
                innerClassName={S.scrollInner}
                offset={{ y: { before: 56, after: 24 } }}
                fadeSize="m"
                autoHide
                ref={scrollRef}
              >
                {messages.map((msg, index, arr) => {
                  const isLast = index === arr.length - 1;
                  return (
                    <Chat.Message
                      key={msg.id}
                      message={msg}
                      role={msg.role}
                      text={msg.text}
                      inProgress={msg.inProgress}
                      userTextFileAttachments={msg.userTextFileAttachments}
                      onQuickReply={onQuickReply}
                      suppressedQuickReplyKeys={suppressedQuickReplyKeys}
                      quickReplyDisabled={isLoading}
                      quickReplyHidden={Boolean(loadingLabel)}
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
                      renderSystemMessage={renderSystemMessage}
                    />
                  );
                })}

                {showSyntheticBranchButtons ? (
                  <div className={S.branchRow}>
                    {unusedBranchKeys.map(key => {
                      const label =
                        displayLabelForBranchKeyFromMessages(key, messages) ??
                        humanizeBranchKey(key);
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
                    })}
                  </div>
                ) : null}

                {showInlinePresets &&
                  renderPresets('inline', { variant })}

                {isLoading &&
                  !hasInProgressSystemMessage &&
                  (isLastMessageFromUser || loadingLabel) && (
                    <TextShimmer duration={1} spread={5} className={S.loader}>
                      {loadingLabel ?? 'Thinking...'}
                    </TextShimmer>
                  )}
              </Scroll>
            </div>
          )}

          {isEmpty ? (
            <div className={S.fixedPresets}>
              {renderPresets('fixed', { variant })}
            </div>
          ) : null}

          {isEmpty ? (
            <div className={S.notice}>
              Forecast Assistant can make mistakes.
            </div>
          ) : null}

          <div className={cn(S.footer, isClean && S.footerClean, footerClassName)}>
            <Chat.Prompt
              className={isClean ? S.promptClean : undefined}
              onSubmit={handlePromptSubmitWithAttachments}
              disabled={promptDisabled}
              attachments={pendingAttachments}
              onRemoveAttachment={handleRemoveAttachment}
              prefillMessage={promptPrefill ?? undefined}
              placeholder={promptPlaceholder}
              slashCommandItems={slashCommandItems}
              onSlashItemCommand={onSlashItemCommand}
              attachmentAccept={
                attachmentsDropzoneEnabled ? attachmentAccept : undefined
              }
              onAttachmentFiles={
                attachmentsDropzoneEnabled ? handleAttachmentFiles : undefined
              }
            />
          </div>
        </Chat>
      </div>
    </div>
  );
}

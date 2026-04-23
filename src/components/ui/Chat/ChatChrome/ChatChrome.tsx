import cn from 'classnames';
import type { RefObject } from 'react';

import type { Message } from '#uilib/components/ui/Chat/Chat.types';
import {
  displayLabelForBranchKeyFromMessages,
  humanizeBranchKey,
} from '#uilib/components/ui/Chat/ChatMessage/presetScript';
import type { ChatPresetsLayout } from '#uilib/components/ui/Chat/ChatPresets';
import { TextShimmer } from '#uilib/components/ui/TextShimmer';
import { Scroll, ScrollRef } from '@homecode/ui';
import { ChartLineIcon, PaperPlaneRightIcon, X } from '@phosphor-icons/react';

import { Button } from '../../Button';
import { PanelResizeHandle } from '../../Sidebar/Sidebar';
import SidebarStem from '../../Sidebar/Sidebar.styl';
import { Chat } from '../Chat';
import S from './ChatChrome.styl';

export type ChatChromeResizeHandleConfig = {
  isActive: boolean;
  startWidthPx: number;
  getShellWidth: () => number;
  onDragWidth: (rawPx: number) => void;
  onDragComplete: (finalRawPx: number) => void;
};

export interface ChatChromeProps {
  showResizeHandle: boolean;
  resizeHandle: ChatChromeResizeHandleConfig | undefined;
  onClose: (() => void) | undefined;
  isEmpty: boolean;
  renderPresets: (layout: ChatPresetsLayout) => React.ReactNode;
  /** Message list for the scroll area; use `[]` when empty. */
  messages: Message[];
  onQuickReply: (branchKey: string, displayLabel: string) => void;
  suppressedQuickReplyKeys: ReadonlySet<string>;
  isLoading: boolean;
  scriptContinueLabel: string | undefined;
  onScriptContinue: (() => void) | undefined;
  renderMessageChart?: () => React.ReactNode;
  showBranchActionsRow: boolean;
  showSyntheticBranchButtons: boolean;
  unusedBranchKeys: string[];
  isScriptComplete: boolean;
  onGenerateDashboard:
    | ((transcript: string) => void | Promise<void>)
    | undefined;
  generatingDashboard: boolean;
  onGenerateDashboardClick: () => void;
  showInlinePresets: boolean;
  isLastMessageFromUser: boolean;
  scrollRef: RefObject<ScrollRef | null>;
  effectiveScopeId: string;
  onPromptSubmit: (message: string) => void | Promise<void>;
  onChatDeleted: (sessionId: string) => void;
}

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
}: ChatChromeProps) {
  return (
    <div className={S.panelRoot}>
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
        <Chat isEmpty={isEmpty}>
          {isEmpty ? (
            <>
              <Chat.EmptyState />
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

          <div className={S.footer}>
            <Chat.Prompt
              id={effectiveScopeId}
              onSubmit={onPromptSubmit}
              disabled={isLoading}
              onChatDeleted={onChatDeleted}
            />
          </div>
        </Chat>
      </div>
    </div>
  );
}

import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  ChatPreset,
  GENERATING_DASHBOARD_SYSTEM_TEXT,
  MessageRole,
  type ScriptCompletePayload,
} from '@/components/ui/Chat/Chat.types';
import {
  branchKeysUsedByUserMessages,
  branchKeysUsedFromChatHistory,
  branchesFromPresetScriptGraph,
  displayLabelForBranchKeyFromMessages,
  entryBranchKeyBeforeLastAssistant,
  extractQuickReplyLabelKeyPairsFromText,
  humanizeBranchKey,
  isGraphIntakeAssistantStepComplete,
  isPresetScriptGraph,
  matchUserTextToQuickReply,
  parseScriptLine,
  textHasQuickReplyMarkers,
} from '@/components/ui/Chat/ChatMessage/presetScript';
import type { ChatPresetsLayout } from '@/components/ui/Chat/ChatPresets';
import {
  formatChatTranscript,
  usedPresetIdsFromMessages,
} from '@/components/ui/Chat/chat-preset-utils';
import { TextShimmer } from '@/components/ui/TextShimmer';
import { useChat, useChatsForDataset } from '@/contexts/chat-context';
import useEvent from '@/hooks/useEvent';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryParams } from '@/hooks/useQueryParams';
import logger from '@/lib/logger';
import { mergePresetFreeformDefaults } from '@/utils/chatPresetMerge';
import { Scroll, ScrollRef } from '@homecode/ui';
import { ChartLineIcon, PaperPlaneRightIcon, X } from '@phosphor-icons/react';

import { Button } from '../../Button';
import { PanelResizeHandle, useSidebar } from '../../Sidebar/Sidebar';
import SidebarStem from '../../Sidebar/Sidebar.styl';
import { Chat } from '../Chat';
import S from './ChatSheet.styl';

export type ChatSheetActions = {
  open: () => void;
  /** Starts a new chat session and opens the panel (same as the new-chat keyboard shortcut). */
  openNewChat: () => void;
};

export interface ChatSheetProps {
  title?: string;
  /** Imperative open / new-chat for triggers outside `renderTrigger` (e.g. sidebar). */
  actionsRef?: React.MutableRefObject<ChatSheetActions | null>;
  renderTrigger?: (toggleOpen: () => void) => React.ReactNode;
  triggerLabel?: React.ReactNode;
  /** aria-label for icon-only trigger (required when trigger has no visible text) */
  triggerAriaLabel?: string;
  presets?: ChatPreset[];
  label?: string;
  datasetId?: string | null;
  onMessage?: (message: string) => void;
  /** Fires when a preset script has no further `[Label|branchKey]` steps (graph leaf or linear script end). */
  onScriptComplete?: (payload: ScriptCompletePayload) => void;
  /** After intake script completes, user can generate a dashboard from the full transcript (e.g. Decision board). */
  onGenerateDashboard?: (transcript: string) => void | Promise<void>;
  /** Renders `[CHART]` tokens in assistant messages. */
  renderMessageChart?: () => React.ReactNode;
}

type IntakeScriptState = {
  presetId: string;
  freeformNext: Record<string, string>;
  scriptStepId: string;
  answers: Record<string, string>;
};

const NO_DATASET_ID = '0';

type PresetScriptState = {
  lines: string[];
  nextIndex: number;
  presetId: string;
};

const SCRIPT_STEP_DELAY_MS = 1200;
const CHAT_NEW_SHORTCUT_KEY = 'o';
/** When chat panel is open, collapse left nav below this width so both don't crowd the viewport. */
const CHAT_NAV_COLLAPSE_BREAKPOINT_PX = 1400;

export function ChatSheet({
  triggerLabel = 'Open Chat',
  triggerAriaLabel,
  actionsRef,
  renderTrigger,
  presets,
  datasetId,
  onMessage,
  onScriptComplete,
  onGenerateDashboard,
  renderMessageChart,
}: ChatSheetProps) {
  const effectiveDatasetId = datasetId ?? NO_DATASET_ID;
  const isMobile = useIsMobile();
  const {
    chatPanelContainer,
    isOpen: sidebarNavOpen,
    setOpen: setSidebarNavOpen,
    chatWidthPx,
    setChatWidthPx,
    getShellWidth,
    setChatPanelOpen,
  } = useSidebar();
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    newChat,
    sendMessage,
    addMessage,
    removeMessageById,
  } = useChatsForDataset(effectiveDatasetId);
  const chat = useChat(effectiveDatasetId, currentChatId);

  const { searchParams, addSearchParams, removeSearchParams } =
    useQueryParams();
  const chatOpen = searchParams.has('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Ensure valid currentChatId when chat opens
  useEffect(() => {
    if (isOpen && (!currentChatId || currentChatId === '')) {
      if (chats.length > 0) {
        // Select the first available chat
        setCurrentChatId(chats[0].session_id);
      } else {
        // Create a new chat if none exists
        newChat();
      }
    }
  }, [isOpen, currentChatId, chats, setCurrentChatId, newChat]);
  const [scriptByChatId, setScriptByChatId] = useState<
    Record<string, PresetScriptState>
  >({});
  /** Local demo: `[Label]` in assistant text → next assistant body from map. */
  const [quickReplyBranchesByChat, setQuickReplyBranchesByChat] = useState<
    Record<string, Record<string, string>>
  >({});
  const [usedScriptBranchKeysByChat, setUsedScriptBranchKeysByChat] = useState<
    Record<string, string[]>
  >({});
  const [intakeByChatId, setIntakeByChatId] = useState<
    Record<string, IntakeScriptState | undefined>
  >({});
  /** Preset intake finished for this session; show [Generate Dashboard] when `onGenerateDashboard` is set. */
  const [scriptCompleteByChatId, setScriptCompleteByChatId] = useState<
    Record<string, boolean>
  >({});
  const [generatingDashboard, setGeneratingDashboard] = useState(false);
  const scriptAdvanceLockRef = useRef(false);
  const quickReplyLockRef = useRef(false);
  const scrollRef = useRef<ScrollRef>(null);

  /** Ensures `freeformNext` for known graph presets when parent omits it (Dashboard/Datasets vs DecisionBoard). */
  const presetsWithFreeform = useMemo(
    () => mergePresetFreeformDefaults(presets ?? []),
    [presets],
  );

  const usedPresetIds = useMemo(
    () => usedPresetIdsFromMessages(chat?.messages, presetsWithFreeform),
    [chat?.messages, presetsWithFreeform],
  );

  const clearScriptForChat = useCallback((chatId: string) => {
    setScriptByChatId(prev => {
      if (!(chatId in prev)) return prev;
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
  }, []);

  const clearQuickReplyBranches = useCallback((chatId: string) => {
    setQuickReplyBranchesByChat(prev => {
      if (!(chatId in prev)) return prev;
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
  }, []);

  const clearUsedScriptBranchKeysForChat = useCallback((chatId: string) => {
    setUsedScriptBranchKeysByChat(prev => {
      if (!(chatId in prev)) return prev;
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
  }, []);

  const clearIntakeForChat = useCallback((chatId: string) => {
    setIntakeByChatId(prev => {
      if (!(chatId in prev)) return prev;
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
  }, []);

  const endLocalDemoFlow = useCallback(
    (chatId: string) => {
      clearScriptForChat(chatId);
      clearQuickReplyBranches(chatId);
      clearUsedScriptBranchKeysForChat(chatId);
      clearIntakeForChat(chatId);
      setScriptCompleteByChatId(prev => {
        if (!(chatId in prev)) return prev;
        const next = { ...prev };
        delete next[chatId];
        return next;
      });
    },
    [
      clearScriptForChat,
      clearQuickReplyBranches,
      clearUsedScriptBranchKeysForChat,
      clearIntakeForChat,
    ],
  );

  const scrollToBottom = () => {
    const inner = scrollRef.current?.innerElem as HTMLDivElement;
    if (inner) {
      inner.scrollTo({
        top: inner.scrollHeight + 1000,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const inner = scrollRef.current?.innerElem as HTMLDivElement;

    if (inner) setTimeout(scrollToBottom, 100);
  }, [chat?.messages.length]);

  const onOpenChange = (open: boolean) => {
    const run = () => {
      setIsOpen(open);
      setChatPanelOpen(open);
    };
    if (
      !isMobile &&
      'startViewTransition' in document &&
      document.startViewTransition
    ) {
      document.startViewTransition(run);
    } else {
      run();
    }

    if (open) {
      // Avoid a second setSearchParams when `chat` is already set (e.g. Reports merges
      // reportId + chat in one update). A redundant add can merge from a stale `prev`
      // and drop other query keys.
      if (!searchParams.has('chat')) {
        addSearchParams({ chat: 'open' });
      }
    } else {
      removeSearchParams('chat');
    }
  };

  useEvent({
    event: 'keydown',
    callback: (e: Event) => {
      const ke = e as KeyboardEvent;
      if (
        ke.key.toLowerCase() !== CHAT_NEW_SHORTCUT_KEY ||
        !(ke.metaKey || ke.ctrlKey) ||
        !ke.shiftKey ||
        ke.altKey
      ) {
        return;
      }
      ke.preventDefault();
      newChat();
      onOpenChange(true);
    },
  });

  const onQuickReply = useCallback(
    (branchKey: string, displayLabel: string) => {
      const chatId = currentChatId;
      if (!chatId) return;

      const branches = quickReplyBranchesByChat[chatId];
      if (
        branches &&
        Object.prototype.hasOwnProperty.call(branches, branchKey)
      ) {
        if (quickReplyLockRef.current) return;
        quickReplyLockRef.current = true;
        setIsLoading(true);
        setUsedScriptBranchKeysByChat(prev => ({
          ...prev,
          [chatId]: [...new Set([...(prev[chatId] || []), branchKey])],
        }));
        addMessage(chatId, MessageRole.USER, displayLabel);

        const intake = intakeByChatId[chatId];
        const presetForBranch = presetsWithFreeform.find(
          p => p.id === intake?.presetId,
        );
        const freeformResolvedForBranch = {
          ...(presetForBranch?.freeformNext ?? {}),
          ...intake?.freeformNext,
        };

        void (async () => {
          try {
            await new Promise(resolve =>
              setTimeout(resolve, SCRIPT_STEP_DELAY_MS),
            );
            const assistantBody = branches[branchKey];
            addMessage(chatId, MessageRole.ASSISTANT, assistantBody);
            const terminal = isGraphIntakeAssistantStepComplete(
              branchKey,
              freeformResolvedForBranch,
              assistantBody,
            );
            let scriptCompletePayload: ScriptCompletePayload | undefined;
            setIntakeByChatId(prev => {
              const s = prev[chatId];
              if (!s) return prev;
              const nextAnswers = { ...s.answers, [branchKey]: displayLabel };
              if (terminal) {
                scriptCompletePayload = {
                  presetId: s.presetId,
                  answers: nextAnswers,
                };
              }
              return {
                ...prev,
                [chatId]: {
                  ...s,
                  scriptStepId: branchKey,
                  answers: nextAnswers,
                },
              };
            });
            if (scriptCompletePayload) {
              setScriptCompleteByChatId(prev => ({
                ...prev,
                [chatId]: true,
              }));
              onScriptComplete?.(scriptCompletePayload);
            }
          } catch (error) {
            logger.error('Error resolving preset quick reply:', error);
          } finally {
            setIsLoading(false);
            quickReplyLockRef.current = false;
          }
        })();
        return;
      }

      endLocalDemoFlow(chatId);
      void (async () => {
        setIsLoading(true);
        try {
          await sendMessage(displayLabel);
          onMessage?.(displayLabel);
        } catch (error) {
          logger.error('Error sending chat message:', error);
        } finally {
          setIsLoading(false);
        }
      })();
    },
    [
      currentChatId,
      intakeByChatId,
      presetsWithFreeform,
      quickReplyBranchesByChat,
      addMessage,
      setUsedScriptBranchKeysByChat,
      endLocalDemoFlow,
      sendMessage,
      onMessage,
      onScriptComplete,
    ],
  );

  const handlePromptSubmit = useCallback(
    async (message: string) => {
      const chatId = currentChatId;
      if (!chatId) return;

      const quickBranches = quickReplyBranchesByChat[chatId];
      const graphActive = Boolean(
        quickBranches && Object.keys(quickBranches).length > 0,
      );
      const intake = intakeByChatId[chatId];

      if (graphActive && intake) {
        const presetForIntake = presetsWithFreeform.find(
          p => p.id === intake.presetId,
        );
        const freeformResolved = {
          ...(presetForIntake?.freeformNext ?? {}),
          ...intake.freeformNext,
        };
        let nextKey = freeformResolved[intake.scriptStepId];
        if (
          (nextKey == null || nextKey === '') &&
          intake.scriptStepId === 'initial' &&
          quickBranches &&
          Object.keys(quickBranches).length === 1
        ) {
          nextKey = Object.keys(quickBranches)[0];
        }

        const messages = chat?.messages ?? [];
        const lastAssistant = [...messages]
          .reverse()
          .find(m => m.role === MessageRole.ASSISTANT);
        if (lastAssistant) {
          const matched = matchUserTextToQuickReply(
            lastAssistant.text,
            message,
          );
          if (matched) {
            onQuickReply(matched.key, matched.label);
            return;
          }
        }
        // Freeform: not nested under `lastAssistant` so we still advance when `freeformNext`
        // applies even if the last assistant row is missing from `chat` for one frame.
        if (
          nextKey &&
          quickBranches &&
          Object.prototype.hasOwnProperty.call(quickBranches, nextKey)
        ) {
          if (quickReplyLockRef.current) return;
          quickReplyLockRef.current = true;
          setIsLoading(true);
          const newAnswers = {
            ...intake.answers,
            [intake.scriptStepId]: message,
          };
          addMessage(chatId, MessageRole.USER, message);
          void (async () => {
            try {
              await new Promise(r => setTimeout(r, SCRIPT_STEP_DELAY_MS));
              const assistantBody = quickBranches[nextKey];
              addMessage(chatId, MessageRole.ASSISTANT, assistantBody);
              const terminal = isGraphIntakeAssistantStepComplete(
                nextKey,
                freeformResolved,
                assistantBody,
              );
              let scriptCompletePayload: ScriptCompletePayload | undefined;
              setIntakeByChatId(prev => {
                const s = prev[chatId];
                if (!s) return prev;
                if (terminal) {
                  scriptCompletePayload = {
                    presetId: s.presetId,
                    answers: newAnswers,
                  };
                }
                return {
                  ...prev,
                  [chatId]: {
                    ...s,
                    scriptStepId: nextKey,
                    answers: newAnswers,
                  },
                };
              });
              if (scriptCompletePayload) {
                setScriptCompleteByChatId(prev => ({
                  ...prev,
                  [chatId]: true,
                }));
                onScriptComplete?.(scriptCompletePayload);
              }
            } catch (e) {
              logger.error('Error advancing freeform preset script:', e);
            } finally {
              setIsLoading(false);
              quickReplyLockRef.current = false;
            }
          })();
          return;
        }
      }

      if (graphActive && !intake) {
        const messages = chat?.messages ?? [];
        const lastAssistant = [...messages]
          .reverse()
          .find(m => m.role === MessageRole.ASSISTANT);
        if (lastAssistant) {
          const matched = matchUserTextToQuickReply(
            lastAssistant.text,
            message,
          );
          if (matched) {
            onQuickReply(matched.key, matched.label);
            return;
          }
        }
      }

      setIsLoading(true);
      try {
        if (chatId) endLocalDemoFlow(chatId);
        await sendMessage(message);
        onMessage?.(message);
      } catch (error) {
        logger.error('Error sending chat message:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentChatId,
      chat?.messages,
      intakeByChatId,
      quickReplyBranchesByChat,
      presetsWithFreeform,
      onQuickReply,
      addMessage,
      endLocalDemoFlow,
      sendMessage,
      onMessage,
      onScriptComplete,
    ],
  );

  const submitPreset = async (preset: ChatPreset) => {
    const script = preset.script;
    const scriptGraph = isPresetScriptGraph(script);
    const hasLinearScript = Array.isArray(script) && script.length > 0;
    const hasReplies = preset.replies && Object.keys(preset.replies).length > 0;
    const isLocalDemo =
      hasLinearScript ||
      scriptGraph ||
      Boolean(preset.answer?.trim()) ||
      Boolean(hasReplies);

    if (!isLocalDemo) {
      if (!currentChatId) return;
      endLocalDemoFlow(currentChatId);
      await handlePromptSubmit(preset.text);
      return;
    }

    setIsLoading(true);
    try {
      if (!currentChatId) return;
      setScriptCompleteByChatId(prev => {
        const next = { ...prev };
        delete next[currentChatId];
        return next;
      });
      addMessage(currentChatId, MessageRole.USER, preset.text);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const firstAssistant = scriptGraph
        ? script.initialMessage
        : (preset.answer ?? '');
      addMessage(currentChatId, MessageRole.ASSISTANT, firstAssistant);

      setScriptByChatId(prev => {
        const next = { ...prev };
        if (hasLinearScript) {
          next[currentChatId] = {
            lines: script,
            nextIndex: 0,
            presetId: preset.id,
          };
        } else {
          delete next[currentChatId];
        }
        return next;
      });
      setQuickReplyBranchesByChat(prev => {
        const next = { ...prev };
        if (scriptGraph) {
          next[currentChatId] = branchesFromPresetScriptGraph(script);
        } else if (hasReplies && !hasLinearScript) {
          next[currentChatId] = preset.replies!;
        } else {
          delete next[currentChatId];
        }
        return next;
      });
      if (scriptGraph || (hasReplies && !hasLinearScript)) {
        setUsedScriptBranchKeysByChat(prev => ({
          ...prev,
          [currentChatId]: [],
        }));
      }
      if (scriptGraph) {
        const fromMerged = presetsWithFreeform.find(p => p.id === preset.id);
        let freeformNext = {
          ...(fromMerged?.freeformNext ?? {}),
          ...(preset.freeformNext ?? {}),
        };
        if (Object.keys(freeformNext).length === 0) {
          const ks = Object.keys(branchesFromPresetScriptGraph(script));
          if (ks.length === 1) {
            freeformNext = { initial: ks[0] };
          }
        }
        setIntakeByChatId(prev => ({
          ...prev,
          [currentChatId!]: {
            presetId: preset.id,
            freeformNext,
            scriptStepId: 'initial',
            answers: {},
          },
        }));
      }
    } catch (error) {
      logger.error('Error sending chat message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeScript = currentChatId
    ? scriptByChatId[currentChatId]
    : undefined;

  const lastMsg = useMemo(() => {
    const msgs = chat?.messages ?? [];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role !== MessageRole.SYSTEM) {
        return msgs[i];
      }
    }
    return undefined;
  }, [chat?.messages]);
  const scriptContinueLabel =
    activeScript &&
    lastMsg?.role === MessageRole.ASSISTANT &&
    activeScript.nextIndex < activeScript.lines.length
      ? parseScriptLine(activeScript.lines[activeScript.nextIndex]).buttonLabel
      : undefined;

  const onScriptContinue = useCallback(() => {
    if (!currentChatId || scriptAdvanceLockRef.current) return;
    const active = scriptByChatId[currentChatId];
    if (!active || active.nextIndex >= active.lines.length) return;
    const { lines, nextIndex } = active;
    const step = parseScriptLine(lines[nextIndex]);
    if (!step.buttonLabel) return;

    const chatId = currentChatId;
    scriptAdvanceLockRef.current = true;
    setIsLoading(true);
    addMessage(chatId, MessageRole.USER, step.buttonLabel);

    void (async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, SCRIPT_STEP_DELAY_MS));
        addMessage(chatId, MessageRole.ASSISTANT, step.displayBody);

        let newIndex = nextIndex + 1;
        while (newIndex < lines.length) {
          const nextLine = parseScriptLine(lines[newIndex]);
          if (nextLine.buttonLabel) break;
          addMessage(chatId, MessageRole.ASSISTANT, nextLine.displayBody);
          newIndex++;
        }

        const linearFinished = newIndex >= lines.length;
        const linearPresetId = active.presetId;

        setScriptByChatId(prev => {
          if (newIndex >= lines.length) {
            const n = { ...prev };
            delete n[chatId];
            return n;
          }
          return {
            ...prev,
            [chatId]: {
              lines,
              nextIndex: newIndex,
              presetId: linearPresetId,
            },
          };
        });
        if (linearFinished) {
          setScriptCompleteByChatId(prev => ({
            ...prev,
            [chatId]: true,
          }));
          onScriptComplete?.({ presetId: linearPresetId, answers: {} });
        }
      } catch (error) {
        logger.error('Error advancing preset script:', error);
      } finally {
        setIsLoading(false);
        scriptAdvanceLockRef.current = false;
      }
    })();
  }, [currentChatId, scriptByChatId, addMessage, onScriptComplete]);

  useEffect(() => {
    setIsOpen(chatOpen);
    setChatPanelOpen(chatOpen);
  }, [chatOpen, setChatPanelOpen]);

  /** When this instance unmounts (e.g. route hides ChatSheet), release shell layout — URL sync alone does not run. */
  useEffect(() => {
    return () => {
      setChatPanelOpen(false);
    };
  }, [setChatPanelOpen]);

  useEffect(() => {
    if (!isOpen || !sidebarNavOpen) return;

    const collapseNavIfNarrow = () => {
      if (window.innerWidth < CHAT_NAV_COLLAPSE_BREAKPOINT_PX) {
        setSidebarNavOpen(false);
      }
    };

    collapseNavIfNarrow();
    window.addEventListener('resize', collapseNavIfNarrow);
    return () => window.removeEventListener('resize', collapseNavIfNarrow);
  }, [isOpen, sidebarNavOpen, setSidebarNavOpen]);

  const renderPresets = (layout: ChatPresetsLayout = 'fixed') => {
    if (!presetsWithFreeform?.length) return null;

    return (
      <Chat.Presets
        chatId={currentChatId ?? ''}
        items={presetsWithFreeform}
        layout={layout}
        usedItemIds={usedPresetIds}
        onSelect={preset => {
          void submitPreset(preset);
        }}
      />
    );
  };

  const isLastMessageFromUser =
    chat?.messages.length > 0 &&
    chat.messages[chat.messages.length - 1]?.role === MessageRole.USER;

  const isEmpty = !chat?.messages?.length && !isLoading;

  const linearScriptActive = Boolean(
    currentChatId && scriptByChatId[currentChatId],
  );
  const quickBranches = currentChatId
    ? quickReplyBranchesByChat[currentChatId]
    : undefined;
  const graphActive = Boolean(
    quickBranches && Object.keys(quickBranches).length > 0,
  );
  const lastAssistantText =
    lastMsg?.role === MessageRole.ASSISTANT ? lastMsg.text : '';
  const lastHasQuickMarkers = Boolean(
    lastAssistantText && textHasQuickReplyMarkers(lastAssistantText),
  );
  const allBranchKeys = useMemo(
    () => (quickBranches ? Object.keys(quickBranches) : []),
    [quickBranches],
  );
  const historyUsedBranchKeysArr = useMemo(
    () => branchKeysUsedFromChatHistory(chat?.messages),
    [chat?.messages],
  );
  const clickedBranchKeys = useMemo((): string[] => {
    if (!currentChatId) return [];
    return usedScriptBranchKeysByChat[currentChatId] ?? [];
  }, [currentChatId, usedScriptBranchKeysByChat]);
  const inferredUsedBranchKeys = useMemo(
    () => branchKeysUsedByUserMessages(chat?.messages, allBranchKeys),
    [chat?.messages, allBranchKeys],
  );
  const lastAssistantQuickPairs = useMemo(() => {
    if (lastMsg?.role !== MessageRole.ASSISTANT) return [];
    return extractQuickReplyLabelKeyPairsFromText(lastMsg.text);
  }, [lastMsg?.role, lastMsg?.text]);
  const entryBranchKeyBeforeLast = useMemo(
    () => entryBranchKeyBeforeLastAssistant(chat?.messages),
    [chat?.messages],
  );
  const usedBranchSet = useMemo(() => {
    const s = new Set<string>([
      ...clickedBranchKeys,
      ...inferredUsedBranchKeys,
    ]);
    for (const k of historyUsedBranchKeysArr) {
      if (allBranchKeys.length === 0 || allBranchKeys.includes(k)) {
        s.add(k);
      }
    }
    return s;
  }, [
    clickedBranchKeys,
    inferredUsedBranchKeys,
    historyUsedBranchKeysArr,
    allBranchKeys,
  ]);
  /** Same keys as synthetic “used” branches, plus lone tell-more after forecast-confidence. */
  const suppressedQuickReplyKeys = useMemo(() => {
    const s = new Set(usedBranchSet);
    if (
      lastAssistantQuickPairs.length === 1 &&
      lastAssistantQuickPairs[0].key === 'tell-more' &&
      entryBranchKeyBeforeLast === 'forecast-confidence'
    ) {
      s.delete('tell-more');
    }
    return s;
  }, [usedBranchSet, lastAssistantQuickPairs, entryBranchKeyBeforeLast]);
  const unusedBranchKeys = allBranchKeys.filter(k => !usedBranchSet.has(k));
  const unsuppressedInlineKeysOnLast = useMemo(
    () =>
      lastAssistantQuickPairs.filter(p => !suppressedQuickReplyKeys.has(p.key)),
    [lastAssistantQuickPairs, suppressedQuickReplyKeys],
  );

  const showSyntheticBranchButtons =
    lastMsg?.role === MessageRole.ASSISTANT &&
    !linearScriptActive &&
    graphActive &&
    (!lastHasQuickMarkers || unsuppressedInlineKeysOnLast.length === 0) &&
    unusedBranchKeys.length > 0;

  const showInlinePresets =
    Boolean(presetsWithFreeform?.length) &&
    lastMsg?.role === MessageRole.ASSISTANT &&
    !linearScriptActive &&
    (!graphActive || (!lastHasQuickMarkers && unusedBranchKeys.length === 0));

  const isScriptComplete = Boolean(
    currentChatId && scriptCompleteByChatId[currentChatId],
  );

  /** Branch row also when intake is done but all branches used (Generate Dashboard only). */
  const showBranchActionsRow =
    showSyntheticBranchButtons ||
    (isScriptComplete && Boolean(onGenerateDashboard) && !generatingDashboard);

  const handleGenerateDashboard = useCallback(async () => {
    if (!currentChatId || !onGenerateDashboard) return;
    const transcript = formatChatTranscript(
      (chat?.messages ?? []).filter(m => m.role !== MessageRole.SYSTEM),
    );
    setGeneratingDashboard(true);
    const systemPlaceholderId = addMessage(
      currentChatId,
      MessageRole.SYSTEM,
      GENERATING_DASHBOARD_SYSTEM_TEXT,
    );
    try {
      await Promise.resolve(onGenerateDashboard(transcript));
      setScriptCompleteByChatId(prev => {
        const next = { ...prev };
        delete next[currentChatId];
        return next;
      });
    } finally {
      if (systemPlaceholderId) {
        removeMessageById(currentChatId, systemPlaceholderId);
      }
      setGeneratingDashboard(false);
    }
  }, [
    currentChatId,
    onGenerateDashboard,
    chat?.messages,
    addMessage,
    removeMessageById,
  ]);

  const onDragChatWidth = useCallback(
    (rawPx: number) => setChatWidthPx(rawPx, { persist: false }),
    [setChatWidthPx],
  );
  const onDragChatComplete = useCallback(
    (finalRawPx: number) => setChatWidthPx(finalRawPx, { persist: true }),
    [setChatWidthPx],
  );

  const panelBody = (
    <div className={S.panelRoot}>
      {!isMobile && (
        <PanelResizeHandle
          edge="leading"
          isActive={isOpen && !isMobile}
          startWidthPx={chatWidthPx}
          getShellWidth={getShellWidth}
          onDragWidth={onDragChatWidth}
          onDragComplete={onDragChatComplete}
          className={cn(SidebarStem.sidebarResizeHandle, S.chatResizeHandle)}
        />
      )}
      <div className={S.panelHeader}>
        <Button
          type="button"
          variant="ghost"
          icon
          className={S.panelClose}
          aria-label="Close chat"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-4" />
        </Button>
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
                {chat?.messages.map((msg, index, arr) => {
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
                              chat?.messages,
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
                        onClick={() => void handleGenerateDashboard()}
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
              id={effectiveDatasetId}
              onSubmit={handlePromptSubmit}
              disabled={isLoading}
              onChatDeleted={endLocalDemoFlow}
            />
          </div>
        </Chat>
      </div>
    </div>
  );

  const toggleOpen = () => onOpenChange(!isOpen);

  if (actionsRef) {
    actionsRef.current = {
      open: () => onOpenChange(true),
      openNewChat: () => {
        newChat();
        onOpenChange(true);
      },
    };
  }

  return (
    <>
      {renderTrigger?.(toggleOpen) ?? (
        <Button
          variant="outline"
          aria-label={triggerAriaLabel}
          onClick={toggleOpen}
        >
          {triggerLabel}
        </Button>
      )}
      {isOpen &&
        chatPanelContainer &&
        createPortal(panelBody, chatPanelContainer)}
    </>
  );
}

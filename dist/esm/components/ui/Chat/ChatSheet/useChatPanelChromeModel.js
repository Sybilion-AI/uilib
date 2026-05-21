import { jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MessageRole, GENERATING_DASHBOARD_SYSTEM_TEXT } from '../Chat.types.js';
import { isGraphIntakeAssistantStepComplete, matchUserTextToQuickReply, isPresetScriptGraph, branchesFromPresetScriptGraph, parseScriptLine, textHasQuickReplyMarkers, branchKeysUsedFromChatHistory, branchKeysUsedByUserMessages, extractQuickReplyLabelKeyPairsFromText, entryBranchKeyBeforeLastAssistant } from '../ChatMessage/presetScript.js';
import { buildChatSendMessagePayload, displayTextFromSendPayload } from '../buildChatSendMessagePayload.js';
import { usedPresetIdsFromMessages, formatChatTranscript } from '../chat-preset-utils.js';
import { useChatsForScopeId, useChat, useChatOutboundPending, useSyncChatPanelBusy, isChatEmpty } from '../../../../contexts/chat-context.js';
import useEvent from '../../../../hooks/useEvent.js';
import { useIsMobile } from '../../../../hooks/useIsMobile.js';
import { useQueryParams } from '../../../../hooks/useQueryParams.js';
import logger from '../../../../lib/logger.js';
import { mergePresetFreeformDefaults } from '../../../../utils/chatPresetMerge.js';
import { useSidebar } from '../../Sidebar/Sidebar.js';
import { Chat } from '../Chat.js';

/** Fallback when `scopeId` prop omitted; apps should pass an explicit composite scope (e.g. `${userId}-dashboard`). */
const NO_SCOPE_FALLBACK = '__uilib_chat_scope_unset__';
const SCRIPT_STEP_DELAY_MS = 1200;
const CHAT_NEW_SHORTCUT_KEY = 'o';
/** When chat panel is open, collapse left nav below this width so both don't crowd the viewport. */
const CHAT_NAV_COLLAPSE_BREAKPOINT_PX = 1400;
const CHAT_QUERY_PARAM = 'chat';
const CHAT_OPEN_VALUE = 'open';
const PROMPT_QUERY_PARAM = 'prompt';
function useChatPanelChromeModel({ embedAsPage, presets, scopeId, onMessage, onScriptComplete, onGenerateDashboard, renderMessageChart, emptyState, allowedAttachments, allowPdfAttachments, onAttachmentsDropped, }) {
    const effectiveScopeId = scopeId ?? NO_SCOPE_FALLBACK;
    const isMobile = useIsMobile();
    const { chatPanelContainer, isOpen: sidebarNavOpen, setOpen: setSidebarNavOpen, chatWidthPx, setChatWidthPx, getShellWidth, setChatPanelOpen, } = useSidebar();
    const [localUiBusy, setLocalUiBusy] = useState(false);
    const { chats, currentChatId, setCurrentChatId, newChat, sendMessage, addMessage, removeMessageById, } = useChatsForScopeId(effectiveScopeId);
    const chat = useChat(effectiveScopeId, currentChatId);
    const isOutboundPending = useChatOutboundPending(effectiveScopeId, currentChatId);
    const isLoading = isOutboundPending || localUiBusy;
    useSyncChatPanelBusy(isLoading);
    const { searchParams, addSearchParams, removeSearchParams, mutateSearchParams, } = useQueryParams();
    const chatOpen = searchParams.has(CHAT_QUERY_PARAM);
    const [isOpen, setIsOpen] = useState(false);
    /** `?prompt=` deep link text for one-shot composer pre-fill (see ChatPrompt). */
    const [promptLinkPrefill, setPromptLinkPrefill] = useState(null);
    /** Deduplicate Strict Mode double `useEffect` on the same mount. */
    const promptParamHandledInEffectRef = useRef(false);
    const panelActive = embedAsPage || isOpen;
    // Ensure valid currentChatId when chat opens
    useEffect(() => {
        if (panelActive && (!currentChatId || currentChatId === '')) {
            if (chats.length > 0) {
                // Select the first available chat
                setCurrentChatId(chats[0].session_id);
            }
            else {
                // Create a new chat if none exists
                newChat();
            }
        }
    }, [panelActive, currentChatId, chats, setCurrentChatId, newChat]);
    const [scriptByChatId, setScriptByChatId] = useState({});
    /** Local demo: `[Label]` in assistant text → next assistant body from map. */
    const [quickReplyBranchesByChat, setQuickReplyBranchesByChat] = useState({});
    const [usedScriptBranchKeysByChat, setUsedScriptBranchKeysByChat] = useState({});
    const [intakeByChatId, setIntakeByChatId] = useState({});
    /** Preset intake finished for this session; show [Generate Dashboard] when `onGenerateDashboard` is set. */
    const [scriptCompleteByChatId, setScriptCompleteByChatId] = useState({});
    const [generatingDashboard, setGeneratingDashboard] = useState(false);
    const scriptAdvanceLockRef = useRef(false);
    const quickReplyLockRef = useRef(false);
    const scrollRef = useRef(null);
    /** Ensures `freeformNext` for known graph presets when parent omits it (Dashboard/Datasets vs DecisionBoard). */
    const presetsWithFreeform = useMemo(() => mergePresetFreeformDefaults(presets ?? []), [presets]);
    const usedPresetIds = useMemo(() => usedPresetIdsFromMessages(chat?.messages, presetsWithFreeform), [chat?.messages, presetsWithFreeform]);
    const clearScriptForChat = useCallback((chatId) => {
        setScriptByChatId(prev => {
            if (!(chatId in prev))
                return prev;
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
    }, []);
    const clearQuickReplyBranches = useCallback((chatId) => {
        setQuickReplyBranchesByChat(prev => {
            if (!(chatId in prev))
                return prev;
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
    }, []);
    const clearUsedScriptBranchKeysForChat = useCallback((chatId) => {
        setUsedScriptBranchKeysByChat(prev => {
            if (!(chatId in prev))
                return prev;
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
    }, []);
    const clearIntakeForChat = useCallback((chatId) => {
        setIntakeByChatId(prev => {
            if (!(chatId in prev))
                return prev;
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
    }, []);
    const endLocalDemoFlow = useCallback((chatId) => {
        clearScriptForChat(chatId);
        clearQuickReplyBranches(chatId);
        clearUsedScriptBranchKeysForChat(chatId);
        clearIntakeForChat(chatId);
        setScriptCompleteByChatId(prev => {
            if (!(chatId in prev))
                return prev;
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
    }, [
        clearScriptForChat,
        clearQuickReplyBranches,
        clearUsedScriptBranchKeysForChat,
        clearIntakeForChat,
    ]);
    const onOpenChange = (open) => {
        if (embedAsPage) {
            return;
        }
        const run = () => {
            setIsOpen(open);
            setChatPanelOpen(open);
        };
        if (!isMobile &&
            'startViewTransition' in document &&
            document.startViewTransition) {
            document.startViewTransition(run);
        }
        else {
            run();
        }
        if (open) {
            // Avoid a second setSearchParams when `chat` is already set (e.g. Reports merges
            // reportId + chat in one update). A redundant add can merge from a stale `prev`
            // and drop other query keys.
            if (!searchParams.has(CHAT_QUERY_PARAM)) {
                addSearchParams({ [CHAT_QUERY_PARAM]: CHAT_OPEN_VALUE });
            }
        }
        else {
            removeSearchParams(CHAT_QUERY_PARAM);
        }
    };
    const isEmpty = isChatEmpty(chat) && !isLoading;
    /**
     * App link: `?prompt=…` — open panel, pre-fill composer, strip param (read once on mount
     * from `location.search`). If the selected session already has messages, `newChat()` first.
     */
    useEffect(() => {
        if (embedAsPage) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const raw = params.get(PROMPT_QUERY_PARAM);
        if (raw == null) {
            return;
        }
        if (raw.trim() === '') {
            mutateSearchParams(n => {
                n.delete(PROMPT_QUERY_PARAM);
            });
            return;
        }
        if (promptParamHandledInEffectRef.current) {
            return;
        }
        promptParamHandledInEffectRef.current = true;
        const needsFirstSession = chats.length === 0;
        if (!isEmpty || needsFirstSession) {
            const sessionId = newChat();
            if (sessionId == null) {
                logger.warn('Chat prompt link: sign in to use the assistant.');
                mutateSearchParams(n => {
                    n.delete(PROMPT_QUERY_PARAM);
                });
                promptParamHandledInEffectRef.current = false;
                return;
            }
        }
        setPromptLinkPrefill(raw.trim());
        mutateSearchParams(n => {
            n.set(CHAT_QUERY_PARAM, CHAT_OPEN_VALUE);
            n.delete(PROMPT_QUERY_PARAM);
        });
        setIsOpen(true);
        setChatPanelOpen(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; reads `window.location` and first-render `chats` / `currentChatId`
    }, []);
    useEvent({
        event: 'keydown',
        callback: (e) => {
            const ke = e;
            if (ke.key.toLowerCase() !== CHAT_NEW_SHORTCUT_KEY ||
                !(ke.metaKey || ke.ctrlKey) ||
                !ke.shiftKey ||
                ke.altKey) {
                return;
            }
            ke.preventDefault();
            newChat();
            onOpenChange(true);
        },
    });
    const onQuickReply = useCallback((branchKey, displayLabel) => {
        const chatId = currentChatId;
        if (!chatId)
            return;
        const branches = quickReplyBranchesByChat[chatId];
        if (branches &&
            Object.prototype.hasOwnProperty.call(branches, branchKey)) {
            if (quickReplyLockRef.current)
                return;
            quickReplyLockRef.current = true;
            setLocalUiBusy(true);
            setUsedScriptBranchKeysByChat(prev => ({
                ...prev,
                [chatId]: [...new Set([...(prev[chatId] || []), branchKey])],
            }));
            addMessage(chatId, MessageRole.USER, displayLabel);
            const intake = intakeByChatId[chatId];
            const presetForBranch = presetsWithFreeform.find(p => p.id === intake?.presetId);
            const freeformResolvedForBranch = {
                ...(presetForBranch?.freeformNext ?? {}),
                ...intake?.freeformNext,
            };
            void (async () => {
                try {
                    await new Promise(resolve => setTimeout(resolve, SCRIPT_STEP_DELAY_MS));
                    const assistantBody = branches[branchKey];
                    addMessage(chatId, MessageRole.ASSISTANT, assistantBody);
                    const terminal = isGraphIntakeAssistantStepComplete(branchKey, freeformResolvedForBranch, assistantBody);
                    let scriptCompletePayload;
                    setIntakeByChatId(prev => {
                        const s = prev[chatId];
                        if (!s)
                            return prev;
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
                }
                catch (error) {
                    logger.error('Error resolving preset quick reply:', error);
                }
                finally {
                    setLocalUiBusy(false);
                    quickReplyLockRef.current = false;
                }
            })();
            return;
        }
        endLocalDemoFlow(chatId);
        void (async () => {
            try {
                await sendMessage(displayLabel);
                onMessage?.(displayLabel);
            }
            catch (error) {
                logger.error('Error sending chat message:', error);
            }
        })();
    }, [
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
    ]);
    const handlePromptSubmit = useCallback(async (message, attachments) => {
        const chatId = currentChatId;
        if (!chatId)
            return;
        const stagedAttachments = attachments ?? [];
        const quickBranches = quickReplyBranchesByChat[chatId];
        const graphActive = Boolean(quickBranches && Object.keys(quickBranches).length > 0);
        const intake = intakeByChatId[chatId];
        if (graphActive && intake) {
            const presetForIntake = presetsWithFreeform.find(p => p.id === intake.presetId);
            const freeformResolved = {
                ...(presetForIntake?.freeformNext ?? {}),
                ...intake.freeformNext,
            };
            let nextKey = freeformResolved[intake.scriptStepId];
            if ((nextKey == null || nextKey === '') &&
                intake.scriptStepId === 'initial' &&
                quickBranches &&
                Object.keys(quickBranches).length === 1) {
                nextKey = Object.keys(quickBranches)[0];
            }
            const messages = chat?.messages ?? [];
            const lastAssistant = [...messages]
                .reverse()
                .find(m => m.role === MessageRole.ASSISTANT);
            if (lastAssistant) {
                const matched = matchUserTextToQuickReply(lastAssistant.text, message);
                if (matched) {
                    onQuickReply(matched.key, matched.label);
                    return;
                }
            }
            // Freeform: not nested under `lastAssistant` so we still advance when `freeformNext`
            // applies even if the last assistant row is missing from `chat` for one frame.
            if (nextKey &&
                quickBranches &&
                Object.prototype.hasOwnProperty.call(quickBranches, nextKey)) {
                if (quickReplyLockRef.current)
                    return;
                quickReplyLockRef.current = true;
                setLocalUiBusy(true);
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
                        const terminal = isGraphIntakeAssistantStepComplete(nextKey, freeformResolved, assistantBody);
                        let scriptCompletePayload;
                        setIntakeByChatId(prev => {
                            const s = prev[chatId];
                            if (!s)
                                return prev;
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
                    }
                    catch (e) {
                        logger.error('Error advancing freeform preset script:', e);
                    }
                    finally {
                        setLocalUiBusy(false);
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
                const matched = matchUserTextToQuickReply(lastAssistant.text, message);
                if (matched) {
                    onQuickReply(matched.key, matched.label);
                    return;
                }
            }
        }
        try {
            if (chatId)
                endLocalDemoFlow(chatId);
            const payload = buildChatSendMessagePayload(message, stagedAttachments);
            await sendMessage(payload);
            onMessage?.(displayTextFromSendPayload(payload));
        }
        catch (error) {
            logger.error('Error sending chat message:', error);
        }
    }, [
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
    ]);
    const submitPreset = useCallback(async (preset) => {
        const script = preset.script;
        const scriptGraph = isPresetScriptGraph(script);
        const hasLinearScript = Array.isArray(script) && script.length > 0;
        const hasReplies = preset.replies && Object.keys(preset.replies).length > 0;
        const isLocalDemo = hasLinearScript ||
            scriptGraph ||
            Boolean(preset.answer?.trim()) ||
            Boolean(hasReplies);
        if (!isLocalDemo) {
            if (!currentChatId)
                return;
            endLocalDemoFlow(currentChatId);
            await handlePromptSubmit(preset.text);
            return;
        }
        setLocalUiBusy(true);
        try {
            if (!currentChatId)
                return;
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
                }
                else {
                    delete next[currentChatId];
                }
                return next;
            });
            setQuickReplyBranchesByChat(prev => {
                const next = { ...prev };
                if (scriptGraph) {
                    next[currentChatId] = branchesFromPresetScriptGraph(script);
                }
                else if (hasReplies && !hasLinearScript) {
                    next[currentChatId] = preset.replies;
                }
                else {
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
                    [currentChatId]: {
                        presetId: preset.id,
                        freeformNext,
                        scriptStepId: 'initial',
                        answers: {},
                    },
                }));
            }
        }
        catch (error) {
            logger.error('Error sending chat message:', error);
        }
        finally {
            setLocalUiBusy(false);
        }
    }, [
        currentChatId,
        endLocalDemoFlow,
        handlePromptSubmit,
        addMessage,
        presetsWithFreeform,
    ]);
    const resolvedEmptyState = useMemo(() => {
        if (!emptyState)
            return undefined;
        const { additionalContent, ...rest } = emptyState;
        return {
            ...rest,
            additionalContent: typeof additionalContent === 'function'
                ? additionalContent({ submitPreset })
                : additionalContent,
        };
    }, [emptyState, submitPreset]);
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
    const scriptContinueLabel = activeScript &&
        lastMsg?.role === MessageRole.ASSISTANT &&
        activeScript.nextIndex < activeScript.lines.length
        ? parseScriptLine(activeScript.lines[activeScript.nextIndex]).buttonLabel
        : undefined;
    const onScriptContinue = useCallback(() => {
        if (!currentChatId || scriptAdvanceLockRef.current)
            return;
        const active = scriptByChatId[currentChatId];
        if (!active || active.nextIndex >= active.lines.length)
            return;
        const { lines, nextIndex } = active;
        const step = parseScriptLine(lines[nextIndex]);
        if (!step.buttonLabel)
            return;
        const chatId = currentChatId;
        scriptAdvanceLockRef.current = true;
        setLocalUiBusy(true);
        addMessage(chatId, MessageRole.USER, step.buttonLabel);
        void (async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, SCRIPT_STEP_DELAY_MS));
                addMessage(chatId, MessageRole.ASSISTANT, step.displayBody);
                let newIndex = nextIndex + 1;
                while (newIndex < lines.length) {
                    const nextLine = parseScriptLine(lines[newIndex]);
                    if (nextLine.buttonLabel)
                        break;
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
            }
            catch (error) {
                logger.error('Error advancing preset script:', error);
            }
            finally {
                setLocalUiBusy(false);
                scriptAdvanceLockRef.current = false;
            }
        })();
    }, [currentChatId, scriptByChatId, addMessage, onScriptComplete]);
    useEffect(() => {
        if (embedAsPage) {
            return;
        }
        setIsOpen(chatOpen);
        setChatPanelOpen(chatOpen);
    }, [embedAsPage, chatOpen, setChatPanelOpen]);
    /** When this instance unmounts (e.g. route hides ChatSheet), release shell layout — URL sync alone does not run. */
    useEffect(() => {
        return () => {
            if (!embedAsPage) {
                setChatPanelOpen(false);
            }
        };
    }, [embedAsPage, setChatPanelOpen]);
    useEffect(() => {
        if (embedAsPage) {
            return;
        }
        if (!isOpen || !sidebarNavOpen)
            return;
        const collapseNavIfNarrow = () => {
            if (window.innerWidth < CHAT_NAV_COLLAPSE_BREAKPOINT_PX) {
                // Chat open uses `startViewTransition`; nested transition here aborts first → AbortError overlay.
                setSidebarNavOpen(false, { viewTransition: false });
            }
        };
        collapseNavIfNarrow();
        window.addEventListener('resize', collapseNavIfNarrow);
        return () => window.removeEventListener('resize', collapseNavIfNarrow);
    }, [embedAsPage, isOpen, sidebarNavOpen, setSidebarNavOpen]);
    const renderPresets = (layout = 'fixed') => {
        if (!presetsWithFreeform?.length)
            return null;
        return (jsx(Chat.Presets, { chatId: currentChatId ?? '', items: presetsWithFreeform, layout: layout, usedItemIds: usedPresetIds, onSelect: preset => {
                void submitPreset(preset);
            } }));
    };
    const isLastMessageFromUser = chat?.messages.length > 0 &&
        chat.messages[chat.messages.length - 1]?.role === MessageRole.USER;
    const linearScriptActive = Boolean(currentChatId && scriptByChatId[currentChatId]);
    const quickBranches = currentChatId
        ? quickReplyBranchesByChat[currentChatId]
        : undefined;
    const graphActive = Boolean(quickBranches && Object.keys(quickBranches).length > 0);
    const lastAssistantText = lastMsg?.role === MessageRole.ASSISTANT ? lastMsg.text : '';
    const lastHasQuickMarkers = Boolean(lastAssistantText && textHasQuickReplyMarkers(lastAssistantText));
    const allBranchKeys = useMemo(() => (quickBranches ? Object.keys(quickBranches) : []), [quickBranches]);
    const historyUsedBranchKeysArr = useMemo(() => branchKeysUsedFromChatHistory(chat?.messages), [chat?.messages]);
    const clickedBranchKeys = useMemo(() => {
        if (!currentChatId)
            return [];
        return usedScriptBranchKeysByChat[currentChatId] ?? [];
    }, [currentChatId, usedScriptBranchKeysByChat]);
    const inferredUsedBranchKeys = useMemo(() => branchKeysUsedByUserMessages(chat?.messages, allBranchKeys), [chat?.messages, allBranchKeys]);
    const lastAssistantQuickPairs = useMemo(() => {
        if (lastMsg?.role !== MessageRole.ASSISTANT)
            return [];
        return extractQuickReplyLabelKeyPairsFromText(lastMsg.text);
    }, [lastMsg?.role, lastMsg?.text]);
    const entryBranchKeyBeforeLast = useMemo(() => entryBranchKeyBeforeLastAssistant(chat?.messages), [chat?.messages]);
    const usedBranchSet = useMemo(() => {
        const s = new Set([
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
        if (lastAssistantQuickPairs.length === 1 &&
            lastAssistantQuickPairs[0].key === 'tell-more' &&
            entryBranchKeyBeforeLast === 'forecast-confidence') {
            s.delete('tell-more');
        }
        return s;
    }, [usedBranchSet, lastAssistantQuickPairs, entryBranchKeyBeforeLast]);
    const unusedBranchKeys = allBranchKeys.filter(k => !usedBranchSet.has(k));
    const unsuppressedInlineKeysOnLast = useMemo(() => lastAssistantQuickPairs.filter(p => !suppressedQuickReplyKeys.has(p.key)), [lastAssistantQuickPairs, suppressedQuickReplyKeys]);
    const showSyntheticBranchButtons = lastMsg?.role === MessageRole.ASSISTANT &&
        !linearScriptActive &&
        graphActive &&
        (!lastHasQuickMarkers || unsuppressedInlineKeysOnLast.length === 0) &&
        unusedBranchKeys.length > 0;
    const showInlinePresets = Boolean(presetsWithFreeform?.length) &&
        lastMsg?.role === MessageRole.ASSISTANT &&
        !linearScriptActive &&
        (!graphActive || (!lastHasQuickMarkers && unusedBranchKeys.length === 0));
    const isScriptComplete = Boolean(currentChatId && scriptCompleteByChatId[currentChatId]);
    /** Branch row also when intake is done but all branches used (Generate Dashboard only). */
    const showBranchActionsRow = showSyntheticBranchButtons ||
        (isScriptComplete && Boolean(onGenerateDashboard) && !generatingDashboard);
    const handleGenerateDashboard = useCallback(async () => {
        if (!currentChatId || !onGenerateDashboard)
            return;
        const transcript = formatChatTranscript((chat?.messages ?? []).filter(m => m.role !== MessageRole.SYSTEM));
        setGeneratingDashboard(true);
        const systemPlaceholderId = addMessage(currentChatId, MessageRole.SYSTEM, GENERATING_DASHBOARD_SYSTEM_TEXT);
        try {
            await Promise.resolve(onGenerateDashboard(transcript));
            setScriptCompleteByChatId(prev => {
                const next = { ...prev };
                delete next[currentChatId];
                return next;
            });
        }
        finally {
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
    const onDragChatWidth = useCallback((rawPx) => setChatWidthPx(rawPx, { persist: false }), [setChatWidthPx]);
    const onDragChatComplete = useCallback((finalRawPx) => setChatWidthPx(finalRawPx, { persist: true }), [setChatWidthPx]);
    const chromeProps = {
        showResizeHandle: !isMobile && !embedAsPage,
        resizeHandle: !isMobile && !embedAsPage
            ? {
                isActive: isOpen && !isMobile,
                startWidthPx: chatWidthPx,
                getShellWidth,
                onDragWidth: onDragChatWidth,
                onDragComplete: onDragChatComplete,
            }
            : undefined,
        onClose: embedAsPage ? undefined : () => onOpenChange(false),
        isEmpty,
        renderPresets,
        messages: chat?.messages ?? [],
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
        onGenerateDashboardClick: () => {
            void handleGenerateDashboard();
        },
        showInlinePresets,
        isLastMessageFromUser,
        scrollRef,
        effectiveScopeId,
        onPromptSubmit: handlePromptSubmit,
        onChatDeleted: endLocalDemoFlow,
        promptPrefill: promptLinkPrefill,
        emptyState: resolvedEmptyState,
        allowedAttachments,
        allowPdfAttachments,
        onAttachmentsDropped,
    };
    const toggleOpen = () => onOpenChange(!isOpen);
    return {
        chromeProps,
        isOpen,
        onOpenChange,
        toggleOpen,
        newChat,
        chatPanelContainer,
    };
}

export { useChatPanelChromeModel };

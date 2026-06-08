import type { HTMLAttributes, ReactNode } from 'react';

import type {
  SlashCommandItem,
  SlashOnItemCommand,
} from '#uilib/tiptap/slash-mention/types';

import type { PresetScriptGraph } from './ChatMessage/presetScript';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

/** USER-only: text file attached to a message; shown as downloadable file row(s). */
export type UserTextFileAttachment = {
  displayName: string;
  filename: string;
  content: string;
};

/** Send full text to the chat API while showing `displayText` + optional file attachment(s) in the UI. */
export type ChatSendMessagePayload = {
  apiMessage: string;
  displayText: string;
  userTextFileAttachments?: UserTextFileAttachment[];
  /** When true, skip adding a USER bubble before the API call (e.g. slash-command actions). */
  omitUserMessage?: boolean;
  /** Shimmer label while waiting on the API; defaults to "Thinking...". */
  loadingLabel?: string;
  /** When set, show as a SYSTEM inProgress bubble instead of the footer shimmer. */
  systemProgressLabel?: string;
};

export type ChatMetaValue = string | number | boolean | null;

export type ChatMeta = Record<string, ChatMetaValue>;

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  userTextFileAttachments?: UserTextFileAttachment[];
  /** SYSTEM-only: transient progress placeholder while work is in flight. */
  inProgress?: boolean;
  meta?: ChatMeta;
}

export interface Chat {
  session_id: string;
  name: string;
  messages: Message[];
  meta?: ChatMeta;
}

export interface ChatPreset {
  id: string;
  /** Button label and exact user message text when the preset is sent (used to detect “used” presets). */
  text: string;
  answer?: string;
  /**
   * Local demo: linear `string[]` (each line may end with ` [Button label]`), or a graph with
   * `initialMessage` + branch keys (slugs or numeric strings) for `[Label|branchKey]` buttons.
   */
  script?: string[] | PresetScriptGraph;
  /**
   * Local demo: assistant text may include `[Label]` buttons; clicking sends the label as user
   * text and appends `replies[label]` as the next assistant message (can include more `[…]`).
   */
  replies?: Record<string, string>;
  /**
   * Local graph: maps step id → next graph key after the user sends a free-text reply (no chip).
   * Use virtual step `initial` after `initialMessage`; other ids match the branch key whose
   * assistant bubble is on screen (e.g. `q_company`, `p_rev`).
   */
  freeformNext?: Record<string, string>;
}

export type ScriptCompletePayload = {
  presetId: string;
  answers: Record<string, string>;
};

export type ChatAttachmentDropItem = {
  file: File;
  /** UTF-8 text for native text files; PDF/DOCX/XLSX yield extracted text. */
  text: string;
  kind: 'text' | 'pdf' | 'docx' | 'xlsx';
};

export interface ChatPromptProps {
  className?: string;
  onSubmit: (message: string, attachments?: ChatAttachmentDropItem[]) => void;
  placeholder?: string;
  presets?: ChatPreset[];
  disabled?: boolean;
  footer?: ReactNode;
  /** Deep link `?prompt=` — one-shot composer pre-fill (see useChatPanelChromeModel). */
  prefillMessage?: string | null;
  /** Disclaimer above composer; default true. ChatChrome sets false when thread has messages. */
  showNotice?: boolean;
  /** Staged files shown above the composer until send. */
  attachments?: ChatAttachmentDropItem[];
  onRemoveAttachment?: (index: number) => void;
  /** HTML `accept` for the attach file picker; set with `onAttachmentFiles`. */
  attachmentAccept?: string;
  /** Called when the user picks files via the attach button. */
  onAttachmentFiles?: (files: File[]) => void;
  /** Slash menu (`/`); omit or pass empty to disable Mention trigger (no default items). */
  slashCommandItems?: SlashCommandItem[];
  /** Custom slash pick handler; return true to skip default mention insert and insert via composer API. */
  onSlashItemCommand?: SlashOnItemCommand;
}

export type ChatMessageClassNames = {
  user?: string;
  assistant?: string;
  system?: string;
};

export type ChatMessageTextClassNames = {
  user?: string;
  assistant?: string;
  system?: string;
};

export interface ChatMessageProps {
  role: MessageRole;
  text: string;
  /** Extra class on the message root wrapper (role layout + defaults still apply). */
  className?: string;
  /** Extra class on the inner text bubble (merged with built-in `.text` styles). */
  textClassName?: string;
  inProgress?: boolean;
  userTextFileAttachments?: UserTextFileAttachment[];
  onQuickReply?: (branchKey: string, displayLabel: string) => void;
  /** Branch keys already taken (e.g. from chat history); hide quick-reply buttons for these. */
  suppressedQuickReplyKeys?: ReadonlySet<string>;
  quickReplyDisabled?: boolean;
  /** Hide bracket quick-reply buttons (e.g. while a custom outbound status is shown). */
  quickReplyHidden?: boolean;
  /** When false, bracket quick-replies render as plain text (no button). */
  isLastMessage?: boolean;
  /** Preset script continuation (last message only); not sent to LLM. */
  scriptContinue?: { label: string };
  onScriptContinue?: () => void;
  /** Renders `[CHART]` placeholder in assistant messages (app supplies dataset chart). */
  renderMessageChart?: () => ReactNode;
  /** Full message for system-role render delegation. */
  message?: Message;
  /** When set, SYSTEM messages render via this callback instead of plain text. */
  renderSystemMessage?: (message: Message) => ReactNode;
}

export interface ChatProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
  /** Chat context scope; when set, header shows chat selector + delete. */
  scopeId?: string;
  onChatDeleted?: (sessionId: string) => void;
  /** "+ New Chat" in the selector; when omitted, starts an empty session. */
  onNewChat?: () => void;
  /** When true, skip built-in header ChatSelector (e.g. external page-header slot). */
  hideChatSelector?: boolean;
}

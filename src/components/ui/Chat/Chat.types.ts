import type { HTMLAttributes, ReactNode } from 'react';

import type { PresetScriptGraph } from './ChatMessage/presetScript';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

/** System placeholder while dashboard generation runs (must match ChatSheet `addMessage` text). */
export const GENERATING_DASHBOARD_SYSTEM_TEXT = 'Generating dashboard…';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export interface Chat {
  session_id: string;
  name: string;
  messages: Message[];
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

export interface ChatPromptProps {
  className?: string;
  id: string;
  onSubmit: (message: string) => void;
  placeholder?: string;
  presets?: ChatPreset[];
  disabled?: boolean;
  footer?: ReactNode;
  onChatDeleted?: (sessionId: string) => void;
}

export interface ChatMessageProps {
  role: MessageRole;
  text: string;
  onQuickReply?: (branchKey: string, displayLabel: string) => void;
  /** Branch keys already taken (e.g. from chat history); hide quick-reply buttons for these. */
  suppressedQuickReplyKeys?: ReadonlySet<string>;
  quickReplyDisabled?: boolean;
  /** When false, bracket quick-replies render as plain text (no button). */
  isLastMessage?: boolean;
  /** Preset script continuation (last message only); not sent to LLM. */
  scriptContinue?: { label: string };
  onScriptContinue?: () => void;
  /** Renders `[CHART]` placeholder in assistant messages (app supplies dataset chart). */
  renderMessageChart?: () => ReactNode;
}

export interface ChatProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
}

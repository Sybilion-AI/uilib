import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ChatChrome,
  Message,
  MessageRole,
  type SlashCommandItem,
} from '#uilib/components/ui/Chat';
import { PageContentSection } from '#uilib/components/ui/Page';
import type { SlashItemCommandContext } from '#uilib/tiptap/slash-mention/types';
import { ScrollRef } from '@homecode/ui';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const NO_QUICK_REPLY_KEYS: ReadonlySet<string> = new Set();

const DOCS_SAMPLE_COMMAND_ID = 'sample-command';

/** Sample items so the docs demo still shows a `/` palette (`DEFAULT_CHAT_SLASH_ITEMS` is empty). */
const DOCS_SAMPLE_SLASH_ITEMS: SlashCommandItem[] = [
  {
    id: DOCS_SAMPLE_COMMAND_ID,
    label: DOCS_SAMPLE_COMMAND_ID,
    description:
      'Demo handler — clears composer and runs `onSlashItemCommand` (no mention insert).',
  },
];

const SAMPLE_COMMAND_PROGRESS_TEXT = 'Running sample command…';

const SAMPLE_COMMAND_SUCCESS_TEXT = '✅ Sample command complete.';

function makeMessage(
  role: MessageRole,
  text: string,
  options?: { inProgress?: boolean },
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    timestamp: Date.now(),
    ...(options?.inProgress ? { inProgress: true } : {}),
  };
}

/** Local-state equivalent of chat-context `updateMessageById`. */
function updateMessageInPlace(
  messages: Message[],
  messageId: string,
  patch: { role?: MessageRole; text?: string; inProgress?: boolean },
): Message[] {
  return messages.map(message => {
    if (message.id !== messageId) return message;
    const next: Message = { ...message };
    if (patch.role != null) {
      next.role = patch.role;
    }
    if (patch.text != null) {
      next.text = patch.text;
    }
    if (patch.inProgress === true) {
      next.inProgress = true;
    } else if (
      patch.inProgress === false ||
      (patch.role != null && patch.role !== MessageRole.SYSTEM)
    ) {
      delete next.inProgress;
    }
    return next;
  });
}

const ASSISTANT_REPLY_TEXT =
  'Demo reply for a normal message. Slash picks with a custom handler skip mention insert.';

export default function ChatSlashCommandsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollRef>(null);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current != null) {
        clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  const isEmpty = messages.length === 0 && !isLoading;
  const isLastMessageFromUser =
    messages.length > 0 &&
    messages[messages.length - 1]?.role === MessageRole.USER;

  const runSampleCommand = useCallback(() => {
    const progressId = crypto.randomUUID();
    setIsLoading(true);
    setMessages(prev => [
      ...prev,
      {
        id: progressId,
        role: MessageRole.SYSTEM,
        text: SAMPLE_COMMAND_PROGRESS_TEXT,
        timestamp: Date.now(),
        inProgress: true,
      },
    ]);

    if (replyTimeoutRef.current != null) {
      clearTimeout(replyTimeoutRef.current);
    }
    replyTimeoutRef.current = setTimeout(() => {
      replyTimeoutRef.current = null;
      setMessages(prev =>
        updateMessageInPlace(prev, progressId, {
          role: MessageRole.ASSISTANT,
          text: SAMPLE_COMMAND_SUCCESS_TEXT,
          inProgress: false,
        }),
      );
      setIsLoading(false);
    }, 1200);
  }, []);

  const onSlashItemCommand = useCallback(
    ({ item }: SlashItemCommandContext) => {
      if (item.id !== DOCS_SAMPLE_COMMAND_ID) {
        return false;
      }
      queueMicrotask(() => runSampleCommand());
      return true;
    },
    [runSampleCommand],
  );

  const onSubmit = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || isLoading) return;

      if (text === `/${DOCS_SAMPLE_COMMAND_ID}`) {
        runSampleCommand();
        return;
      }

      setMessages(prev => [...prev, makeMessage(MessageRole.USER, text)]);
      setIsLoading(true);

      if (replyTimeoutRef.current != null) {
        clearTimeout(replyTimeoutRef.current);
      }
      replyTimeoutRef.current = setTimeout(() => {
        replyTimeoutRef.current = null;
        setMessages(prev => [
          ...prev,
          makeMessage(MessageRole.ASSISTANT, ASSISTANT_REPLY_TEXT),
        ]);
        setIsLoading(false);
      }, 900);
    },
    [isLoading, runSampleCommand],
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chat' }, { label: 'Chat slash commands' }]}
        title="Chat slash commands"
        subheader={`Slash palette uses TipTap Mention with "/" as the trigger. Pass slashCommandItems from the app; optional onSlashItemCommand can clear the composer and run an action instead of inserting a mention. Long-running handlers can append a SYSTEM message with inProgress while work is in flight, then update it in place (e.g. via updateMessageById) to a final assistant message when done.`}
        actions={
          <DocsHeaderActions slashCommandItems={DOCS_SAMPLE_SLASH_ITEMS} />
        }
      />
      <PageContentSection>
        <p style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
          Same{' '}
          <Link className="underline underline-offset-2" to="/docs/chat">
            Chat
          </Link>{' '}
          shell below: scrolling history, empty state, disclaimer, composer.
          Type <kbd className="font-mono">/</kbd> at line start or after a
          space; pick <kbd className="font-mono">sample-command</kbd> to run the
          custom handler (shows an <kbd className="font-mono">inProgress</kbd>{' '}
          shimmer, then updates the same message to a success assistant reply),
          or send <kbd className="font-mono">/sample-command</kbd> with Enter.
        </p>
        <ChatChrome
          showResizeHandle={false}
          resizeHandle={undefined}
          onClose={undefined}
          isEmpty={isEmpty}
          renderPresets={() => null}
          messages={messages}
          onQuickReply={() => {}}
          suppressedQuickReplyKeys={NO_QUICK_REPLY_KEYS}
          isLoading={isLoading}
          scriptContinueLabel={undefined}
          onScriptContinue={undefined}
          showSyntheticBranchButtons={false}
          unusedBranchKeys={[]}
          showInlinePresets={false}
          isLastMessageFromUser={isLastMessageFromUser}
          scrollRef={scrollRef}
          effectiveScopeId="docs-chat-slash-inline"
          onPromptSubmit={onSubmit}
          onChatDeleted={() => {}}
          slashCommandItems={DOCS_SAMPLE_SLASH_ITEMS}
          onSlashItemCommand={onSlashItemCommand}
          promptPlaceholder='Ask something or type "/" for demo commands…'
          emptyState={{
            title: 'Try a slash command',
            description:
              'Pick sample-command from the palette or send /sample-command — inProgress placeholder shimmers, then becomes "✅ Sample command complete." in the same slot.',
          }}
        />
      </PageContentSection>
    </>
  );
}

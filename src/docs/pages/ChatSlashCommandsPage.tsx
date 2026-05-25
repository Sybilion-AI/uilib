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

const SAMPLE_COMMAND_REPLY_TEXT =
  'Sample command ran via `onSlashItemCommand` — composer cleared, no mention inserted.';

const ASSISTANT_REPLY_TEXT =
  'Demo reply for a normal message. Slash picks with a custom handler skip mention insert.';

function makeMessage(role: MessageRole, text: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    timestamp: Date.now(),
  };
}

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
    setMessages(prev => [
      ...prev,
      makeMessage(MessageRole.ASSISTANT, SAMPLE_COMMAND_REPLY_TEXT),
    ]);
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
        subheader={`Slash palette uses TipTap Mention with "/" as the trigger. Pass slashCommandItems from the app; optional onSlashItemCommand can clear the composer and run an action instead of inserting a mention.`}
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
          custom handler, or send{' '}
          <kbd className="font-mono">/sample-command</kbd> with Enter.
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
              'Pick sample-command from the palette or send /sample-command — onSlashItemCommand clears the composer and runs the demo action.',
          }}
        />
      </PageContentSection>
    </>
  );
}

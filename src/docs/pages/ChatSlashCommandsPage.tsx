import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ChatChrome,
  Message,
  MessageRole,
  type SlashCommandItem,
} from '#uilib/components/ui/Chat';
import { PageContentSection } from '#uilib/components/ui/Page';
import { ScrollRef } from '@homecode/ui';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const NO_QUICK_REPLY_KEYS: ReadonlySet<string> = new Set();

/** Sample items so the docs demo still shows a `/` palette (`DEFAULT_CHAT_SLASH_ITEMS` is empty). */
const DOCS_SAMPLE_SLASH_ITEMS: SlashCommandItem[] = [
  {
    id: 'sample-command',
    label: 'sample-command',
    description:
      'Demo only — define `slashCommandItems` in your app to list real commands.',
  },
];

const ASSISTANT_REPLY_TEXT =
  'Demo reply. Picked slash text is `/sample-command` via TipTap Mention (plain-text round-trip with renderText).';

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

  const onSubmit = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || isLoading) return;

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
    [isLoading],
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chat' }, { label: 'Chat slash commands' }]}
        title="Chat slash commands"
        subheader={`Slash palette uses TipTap Mention with "/" as the trigger. Library default item list is empty — pass slashCommandItems from the app (this page uses a sample item for the demo).`}
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <p style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
          Same{' '}
          <Link className="underline underline-offset-2" to="/docs/chat">
            Chat
          </Link>{' '}
          shell below: scrolling history, empty state, disclaimer, composer.
          Type <kbd className="font-mono">/</kbd> at line start or after a
          space; pick with arrows + Enter or click, then send.
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
          showBranchActionsRow={false}
          showSyntheticBranchButtons={false}
          unusedBranchKeys={[]}
          isScriptComplete={false}
          onGenerateDashboard={undefined}
          generatingDashboard={false}
          onGenerateDashboardClick={() => {}}
          showInlinePresets={false}
          isLastMessageFromUser={isLastMessageFromUser}
          scrollRef={scrollRef}
          effectiveScopeId="docs-chat-slash-inline"
          onPromptSubmit={onSubmit}
          onChatDeleted={() => {}}
          slashCommandItems={DOCS_SAMPLE_SLASH_ITEMS}
          promptPlaceholder='Ask something or type "/" for demo commands…'
          emptyState={{
            title: 'Try a slash command',
            description:
              'This demo mounts one sample slash item. Production: pass slashCommandItems to ChatChrome so `/` opens your palette.',
            additionalContent: (
              <p>Optional empty-state slot via additionalContent.</p>
            ),
          }}
        />
      </PageContentSection>
    </>
  );
}

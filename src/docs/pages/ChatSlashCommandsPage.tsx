import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ChatChrome,
  Message,
  MessageRole,
  type SlashCommandItem,
} from '#uilib/components/ui/Chat';
import chatSlashCommandsGuidance from '#uilib/components/ui/Chat/ChatChrome/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';
import { ScrollRef } from '@homecode/ui';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const NO_QUICK_REPLY_KEYS: ReadonlySet<string> = new Set();

/** Sample items — default TipTap mention insert; optional `className` / `color` style the chip. */
const DOCS_SLASH_ITEMS: SlashCommandItem[] = [
  {
    id: 'generate-report',
    label: 'Generate report',
    description: 'Insert /generate-report',
    color: 'var(--brand-color-600)',
  },
  {
    id: 'performance-chart',
    label: 'Performance chart (bigger font)',
    description: 'Insert /PerformanceChart',
    className: 'docs-slash-mention-accent',
    color: '#16a34a',
  },
  {
    id: 'mention-fallback',
    label: 'Mention fallback',
    description: 'Default mention styling only',
    color: 'var(--foreground)',
  },
];

function makeMessage(role: MessageRole, text: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    timestamp: Date.now(),
  };
}

const ASSISTANT_REPLY_TEXT =
  'Demo reply. Slash picks insert inline mention chips; plain text on send uses each item id (e.g. /generate-report).';

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

  const onSubmit = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;

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
  }, []);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chat' }, { label: 'Chat slash commands' }]}
        title="Chat slash commands"
        subheader={`Slash palette uses TipTap Mention with "/" as the trigger. Pass slashCommandItems from the app — each item inserts an inline mention chip by default. Optional className and color on SlashCommandItem style the chip in the composer.`}
        actions={<DocsHeaderActions slashCommandItems={DOCS_SLASH_ITEMS} />}
      />
      <DocsGuidance source={chatSlashCommandsGuidance} />
      <PageContentSection>
        <p style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
          Same{' '}
          <Link className="underline underline-offset-2" to="/docs/chat">
            Chat
          </Link>{' '}
          shell below. Type <kbd className="font-mono">/</kbd> at line start or
          after a space, then pick a command — the composer inserts a styled
          mention chip. Items can set <kbd className="font-mono">className</kbd>{' '}
          and <kbd className="font-mono">color</kbd> on{' '}
          <kbd className="font-mono">SlashCommandItem</kbd>.
        </p>
        <style>{`
          .docs-slash-mention-accent {
            font-size: 150%;
          }
        `}</style>
        <div style={{ minHeight: 600 }}>
          <ChatChrome
            variant="clean"
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
            slashCommandItems={DOCS_SLASH_ITEMS}
            promptPlaceholder='Ask something or type "/" for demo commands…'
            emptyState={{
              title: 'Try slash commands',
              description:
                'Pick a command from the palette to insert a mention chip with optional className and color.',
            }}
          />
        </div>
      </PageContentSection>
    </>
  );
}

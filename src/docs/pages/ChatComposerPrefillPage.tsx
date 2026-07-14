import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import {
  ChatChrome,
  type ChatSheetActions,
  type Message,
  MessageRole,
} from '#uilib/components/ui/Chat';
import chatComposerPrefillGuidance from '#uilib/components/ui/Chat/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';
import { ScrollRef } from '@homecode/ui';
import { MessageSquare } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DOCS_CHAT_USER_KEY } from '../docsConstants';
import { DocsHeaderActions } from '../docsHeaderActions';

const NO_QUICK_REPLY_KEYS: ReadonlySet<string> = new Set();

const SAMPLE_PREFILL =
  'Summarize revenue trends for Q4 and highlight outliers.';

const ASSISTANT_REPLY_TEXT =
  'Prefill demo reply — composer should stay editable after send.';

function makeMessage(role: MessageRole, text: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    timestamp: Date.now(),
  };
}

const DOCS_CHAT_PREFILL_SCOPE_ID = `${DOCS_CHAT_USER_KEY}-docs-composer-prefill`;

export default function ChatComposerPrefillPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inlinePrefill, setInlinePrefill] = useState<string | null>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollRef>(null);
  const sheetActionsRef = useRef<ChatSheetActions | null>(null);

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
      setInlinePrefill(null);

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

  const prefillInlineComposer = useCallback(() => {
    setInlinePrefill(SAMPLE_PREFILL);
  }, []);

  const openSheetWithPrefill = useCallback(() => {
    sheetActionsRef.current?.openNewChatWithPrefill(SAMPLE_PREFILL);
  }, []);

  const promptDeepLink = `/docs/chat-composer-prefill?prompt=${encodeURIComponent(SAMPLE_PREFILL)}`;

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chat' }, { label: 'Composer prefill' }]}
        title="Chat — composer prefill & focus"
        subheader="Prefill the TipTap composer via prefillMessage, ChatSheetActions.openNewChatWithPrefill, or a ?prompt= deep link. Cursor lands at end; message is not auto-sent."
        actions={
          <DocsHeaderActions
            actionsRef={sheetActionsRef}
            scopeId={DOCS_CHAT_PREFILL_SCOPE_ID}
            triggerLabel={<MessageSquare size={20} />}
            triggerAriaLabel="AI Assistant"
            emptyState={{
              title: 'Start a conversation',
              description:
                'Use the buttons below or ?prompt= to pre-fill this composer.',
            }}
          />
        }
      />
      <DocsGuidance source={chatComposerPrefillGuidance} />
      <PageContentSection>
        <p style={{ marginBottom: 12, fontSize: 14, lineHeight: 1.5 }}>
          After prefill, the composer receives focus at the end of the text so
          users can edit before sending. Wired through{' '}
          <code style={{ fontSize: 13 }}>useChatPromptEditor</code> (
          <code style={{ fontSize: 13 }}>prefillMessage</code>) and{' '}
          <code style={{ fontSize: 13 }}>useChatPanelChromeModel</code> (
          <code style={{ fontSize: 13 }}>promptPrefill</code> /{' '}
          <code style={{ fontSize: 13 }}>openNewChatWithPrefill</code>).
        </p>
        <p
          style={{
            marginBottom: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={prefillInlineComposer}
          >
            Prefill inline composer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openSheetWithPrefill}
          >
            Open portal chat with prefill
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={promptDeepLink}>Try ?prompt= deep link</a>
          </Button>
        </p>
        <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
          What to verify
        </h3>
        <ul
          style={{
            margin: '0 0 16px',
            paddingLeft: 20,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <li>Composer shows sample text; caret at end (not start)</li>
          <li>User can type or edit before Enter / submit</li>
          <li>Prefill does not send until user submits</li>
          <li>
            Portal path: new session opens, panel visible, same focus behavior
          </li>
          <li>
            Deep link strips <code style={{ fontSize: 13 }}>?prompt=</code> and
            opens chat with prefill once
          </li>
        </ul>
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
            effectiveScopeId="docs-chat-composer-prefill-inline"
            onPromptSubmit={onSubmit}
            onChatDeleted={() => {}}
            promptPrefill={inlinePrefill}
            emptyState={{
              title: 'Inline prefill demo',
              description:
                'Click “Prefill inline composer” or type below. Portal and ?prompt= use the header ChatSheet.',
            }}
          />
        </div>
      </PageContentSection>
    </>
  );
}

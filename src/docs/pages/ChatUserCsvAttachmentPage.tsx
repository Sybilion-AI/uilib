import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import {
  ChatChrome,
  type Message,
  MessageRole,
} from '#uilib/components/ui/Chat';
import { PageContentSection } from '#uilib/components/ui/Page';
import { ScrollRef } from '@homecode/ui';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const NO_QUICK_REPLY_KEYS: ReadonlySet<string> = new Set();

const SAMPLE_CSV = `Name,Score
Alice,10
Bob,20`;

const ASSISTANT_ACK =
  'Received your message. Use the file row below the text bubble to download the CSV sample.';

const ASSISTANT_REPLY_TYPED =
  'Plain reply for typed messages. Use “Load preset-style…” for the CSV attachment demo.';

function makeMessage(role: MessageRole, text: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    timestamp: Date.now(),
  };
}

function makeUserMessageWithCsv(
  displayText: string,
  displayName: string,
): Message {
  return {
    id: crypto.randomUUID(),
    role: MessageRole.USER,
    text: displayText,
    timestamp: Date.now(),
    userTextFileAttachments: [
      {
        displayName,
        filename: 'docs-sample.csv',
        content: SAMPLE_CSV,
      },
    ],
  };
}

export default function ChatUserCsvAttachmentPage() {
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

  const addCsvDemo = useCallback(() => {
    if (isLoading) return;
    const displayText =
      'Open procurement buys analysis "Am I overpaying on my open orders?" Open buys (sample)';

    setMessages(prev => [
      ...prev,
      makeUserMessageWithCsv(displayText, 'Open buys (sample)'),
    ]);
    setIsLoading(true);

    if (replyTimeoutRef.current != null) clearTimeout(replyTimeoutRef.current);

    replyTimeoutRef.current = setTimeout(() => {
      replyTimeoutRef.current = null;
      setMessages(prev => [
        ...prev,
        makeMessage(MessageRole.ASSISTANT, ASSISTANT_ACK),
      ]);
      setIsLoading(false);
    }, 500);
  }, [isLoading]);

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
          makeMessage(MessageRole.ASSISTANT, ASSISTANT_REPLY_TYPED),
        ]);
        setIsLoading(false);
      }, 900);
    },
    [isLoading],
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chat' }, { label: 'User CSV attachment' }]}
        title="Chat — user CSV attachment"
        subheader="USER bubble with separate downloadable CSV row (dashboard preset pattern)."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <p style={{ marginBottom: 16 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCsvDemo}
          >
            Load preset-style message + CSV attachment
          </Button>
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
          effectiveScopeId="docs-chat-user-csv"
          onPromptSubmit={onSubmit}
          onChatDeleted={() => {}}
          emptyState={{
            title: 'CSV attachment demo',
            description:
              'Click the button above or send any message. The CSV row uses the same UI as dashboard presets.',
          }}
        />
      </PageContentSection>
    </>
  );
}

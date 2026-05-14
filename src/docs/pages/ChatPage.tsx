import { useCallback, useEffect, useRef, useState } from 'react';

import { ChatChrome, Message, MessageRole } from '#uilib/components/ui/Chat';
import { PageContentSection } from '#uilib/components/ui/Page';
import { ScrollRef } from '@homecode/ui';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const NO_QUICK_REPLY_KEYS: ReadonlySet<string> = new Set();

const ASSISTANT_REPLY_TEXT =
  'This is a generic assistant reply for the docs preview. Wire your app to a real model here.';

function makeMessage(role: MessageRole, text: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    timestamp: Date.now(),
  };
}

export default function ChatPage() {
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
        breadcrumbs={[{ label: 'Chat' }]}
        title="Chat"
        subheader="Chat shell with message list and prompt."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
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
          effectiveScopeId="docs-chat-inline"
          onPromptSubmit={onSubmit}
          onChatDeleted={() => {}}
          emptyState={{
            title: 'Start a conversation',
            description:
              'Send a message below. This demo appends a canned reply after a short delay.',
          }}
        />
      </PageContentSection>
    </>
  );
}

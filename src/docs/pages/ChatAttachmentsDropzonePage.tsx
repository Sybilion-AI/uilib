import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type ChatAttachmentDropItem,
  ChatChrome,
  type Message,
  MessageRole,
  TEXT_ATTACHMENT_ACCEPT_PARTS,
} from '#uilib/components/ui/Chat';
import { PageContentSection } from '#uilib/components/ui/Page';
import chatAttachmentsDropzoneGuidance from '#uilib/docs/agent-guidance/chat-attachments-dropzone.md';
import { ScrollRef } from '@homecode/ui';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const NO_QUICK_REPLY_KEYS: ReadonlySet<string> = new Set();

const ASSISTANT_REPLY =
  'Message received. Attachment text is included in the user bubble above.';

function makeMessage(role: MessageRole, text: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    timestamp: Date.now(),
  };
}

function formatAttachmentUserText(items: ChatAttachmentDropItem[]): string {
  return items
    .map(item => {
      const preview =
        item.text.length > 400
          ? `${item.text.slice(0, 400).trim()}…`
          : item.text.trim();
      return `[${item.kind}] ${item.file.name}\n\n${preview || '(empty file)'}`;
    })
    .join('\n\n---\n\n');
}

function formatSubmittedMessage(
  text: string,
  attachments?: ChatAttachmentDropItem[],
): string {
  const parts = [
    text.trim(),
    attachments?.length ? formatAttachmentUserText(attachments) : '',
  ].filter(Boolean);
  return parts.join('\n\n');
}

export default function ChatAttachmentsDropzonePage() {
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

  const onPromptSubmit = useCallback(
    (raw: string, attachments?: ChatAttachmentDropItem[]) => {
      const body = formatSubmittedMessage(raw, attachments);
      if (!body || isLoading) return;

      setMessages(prev => [...prev, makeMessage(MessageRole.USER, body)]);
      setIsLoading(true);

      if (replyTimeoutRef.current != null) {
        clearTimeout(replyTimeoutRef.current);
      }
      replyTimeoutRef.current = setTimeout(() => {
        replyTimeoutRef.current = null;
        setMessages(prev => [
          ...prev,
          makeMessage(MessageRole.ASSISTANT, ASSISTANT_REPLY),
        ]);
        setIsLoading(false);
      }, 900);
    },
    [isLoading],
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chat' }, { label: 'Attachments dropzone' }]}
        title="Chat — attachments dropzone"
        subheader="Drop text, Office, or PDF files onto the chat shell; they appear on the prompt until you send."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={chatAttachmentsDropzoneGuidance} />
      <PageContentSection>
        <p style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
          Drop a <code>.txt</code>, <code>.csv</code>, <code>.md</code>,{' '}
          <code>.docx</code>, <code>.xlsx</code>, or <code>.pdf</code> file
          anywhere on the chat panel. The file shows above the composer; press
          send to post it. Office and PDF parsers load on demand when you attach
          those types; PDF also requires <code>allowPdfAttachments</code>.
        </p>
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
            effectiveScopeId="docs-chat-attachments-dropzone"
            onPromptSubmit={onPromptSubmit}
            onChatDeleted={() => {}}
            allowedAttachments={TEXT_ATTACHMENT_ACCEPT_PARTS}
            allowPdfAttachments
            emptyState={{
              title: 'Drop a text, Office, or PDF file',
              description:
                'Drag a file onto this panel, review it above the composer, then send. DOCX and XLSX are parsed in the browser.',
              additionalContent: (
                <p style={{ fontSize: 13, opacity: 0.85 }}>
                  Accepted types include <code>.txt</code>, <code>.csv</code>,{' '}
                  <code>.md</code>, <code>.json</code>, <code>.docx</code>,{' '}
                  <code>.xlsx</code>, and more (
                  {TEXT_ATTACHMENT_ACCEPT_PARTS.length} entries in the text
                  allowlist).
                </p>
              ),
            }}
          />
        </div>
      </PageContentSection>
    </>
  );
}

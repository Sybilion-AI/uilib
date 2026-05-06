import { useState } from 'react';

import {
  Chat,
  ChatMessage,
  ChatPrompt,
  MessageRole,
} from '#uilib/components/ui/Chat';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function ChatPage() {
  const [text, setText] = useState('');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chat' }]}
        title="Chat"
        subheader="Chat shell with message list and prompt."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{
          maxWidth: 560,
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <Chat>
          <ChatMessage
            role={MessageRole.ASSISTANT}
            text="This is a static assistant message in the docs preview."
          />
          <ChatMessage role={MessageRole.USER} text="Example user message." />
          <ChatPrompt
            id="docs-chat-inline"
            placeholder="Message…"
            onSubmit={msg => {
              setText(msg);
            }}
          />
          {text ? (
            <p
              style={{
                marginTop: 12,
                fontSize: 12,
                color: 'var(--muted-foreground)',
              }}
            >
              Last submit (local only): {text}
            </p>
          ) : null}
        </Chat>
      </PageContentSection>
    </>
  );
}

import { ChatSheet, ChatSheetProps } from '#uilib/components/ui/Chat';
import { MessageSquare } from 'lucide-react';

import { DOCS_CHAT_SCOPE_ID } from './docsConstants';

export function DocsHeaderActions(props: ChatSheetProps) {
  return (
    <ChatSheet
      triggerLabel={
        <>
          <MessageSquare size={20} />
          &nbsp;Chat
        </>
      }
      scopeId={DOCS_CHAT_SCOPE_ID}
      emptyState={{
        title: 'Start a conversation',
        description:
          'Send a message below. This demo appends a canned reply after a short delay.',
        additionalContent: (
          <p>Optional empty-state slot via additionalContent.</p>
        ),
      }}
      {...props}
    />
  );
}

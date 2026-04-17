import { ChatSheet } from '#uilib/components/ui/Chat';
import { MessageSquare } from 'lucide-react';

import { ThemeToggle } from './App/ThemeToggle';
import { DOCS_CHAT_SCOPE_ID } from './docsConstants';

export function DocsHeaderActions() {
  return (
    <>
      <ChatSheet
        triggerLabel={
          <>
            <MessageSquare size={20} />
            &nbsp;Chat
          </>
        }
        scopeId={DOCS_CHAT_SCOPE_ID}
      />
      <ThemeToggle />
    </>
  );
}

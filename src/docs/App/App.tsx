import { Navigate, Route, Routes } from 'react-router-dom';

import { SidebarProvider } from '#uilib/components/ui/Sidebar/Sidebar';
import { ChatProvider } from '#uilib/contexts/chat-context';
import type { ChatResponse } from '#uilib/types/chat-api.types';

import { DocPage } from '../DocPage';
import { DocsShell } from '../DocsShell';
import { DOCS_CHAT_USER_KEY } from '../docsConstants';
import { DOC_DEFAULT_SLUG } from '../registry';

async function mockDocsSendChatMessage(
  message: string,
  targetChatId: string,
): Promise<ChatResponse> {
  await new Promise<void>(resolve => {
    setTimeout(resolve, 350);
  });
  return {
    response: `Echo (docs demo): ${message}`,
    session_id: targetChatId,
  };
}

export default function App() {
  return (
    <SidebarProvider>
      <ChatProvider
        userSwitchKey={DOCS_CHAT_USER_KEY}
        sendChatMessage={mockDocsSendChatMessage}
      >
        <Routes>
          <Route
            path="/"
            element={<Navigate to={`/docs/${DOC_DEFAULT_SLUG}`} replace />}
          />
          <Route path="/docs" element={<DocsShell />}>
            <Route index element={<Navigate to={DOC_DEFAULT_SLUG} replace />} />
            <Route path=":slug" element={<DocPage />} />
          </Route>
          <Route
            path="*"
            element={<Navigate to={`/docs/${DOC_DEFAULT_SLUG}`} replace />}
          />
        </Routes>
      </ChatProvider>
    </SidebarProvider>
  );
}

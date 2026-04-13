import { Button } from '#uilib/components/ui/Button';
import { ChatSheet } from '#uilib/components/ui/Chat';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageHeader } from '#uilib/components/ui/Page/PageHeader/PageHeader';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import { SidebarProvider } from '#uilib/components/ui/Sidebar/Sidebar';
import { ChatProvider } from '#uilib/contexts/chat-context';
import type { ChatResponse } from '#uilib/types/chat-api.types';
import { MessageSquare } from 'lucide-react';

import LogoSvg from '../../../assets/logo.svg';
import S from './App.styl';
import { ThemeToggle } from './ThemeToggle';

const DOCS_CHAT_USER_KEY = 1;
const DOCS_CHAT_SCOPE_ID = `${DOCS_CHAT_USER_KEY}-docs`;

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
        <PageScroll className={S.root}>
          <PageHeader
            breadcrumbSidebarTrigger={false}
            breadcrumbs={[{ label: 'Docs' }]}
            title="Sybilion uilib"
            subheader="Docs shell — Webpack + Stylus + React."
            actions={
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
            }
          />
          <div className={S.content}>
            <Button type="button">Sample button</Button>

            <p>
              Scroll this area to exercise PageScroll; header uses PageContext
              for scrolled styling when scroll tracking is enabled.
            </p>
            <p>
              Use Chat in the header for a local demo: messages are echoed after
              a short delay (no backend).
            </p>
          </div>
          <PageFooter
            logo={<LogoSvg />}
            versionLink="/releases"
            versionLabel="1.0.0-docs"
          >
            <p>
              Optional middle slot: compose app-only UI here (debug panel,
              forms).
            </p>
          </PageFooter>
        </PageScroll>
      </ChatProvider>
    </SidebarProvider>
  );
}

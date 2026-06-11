import {
  AppBanner,
  AppShell,
  AppShellMainContent,
} from '#uilib/components/ui/Page';
import {
  DOCS_CHAT_USER_KEY,
  DOCS_SIDEBAR_WIDTH_LS_KEY,
} from '../docsConstants';
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { AppHeaderHost } from '#uilib/components/ui/AppHeader';
import { Button } from '#uilib/components/ui/Button';
import { ChatProvider } from '#uilib/contexts/chat-context';
import type { ChatResponse } from '#uilib/types/chat-api.types';
import { DOC_DEFAULT_SLUG } from '../registry';
import { DocPage } from '../DocPage';
import { DocsSidebar } from '#uilib/docs/components/DocsSidebar/DocsSidebar';
import { Logo } from '#uilib/components/ui/Logo';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import S from '../DocsShell.styl';
import { SidebarProvider } from '#uilib/components/ui/Sidebar/Sidebar';
import { SybilionAppHeader } from '#uilib/components/widgets/SybilionAppHeader';
import { ThemeToggle } from './ThemeToggle';
import cn from 'classnames';
import { useState } from 'react';

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

function DocsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerVisible, setBannerVisible] = useState(false);

  return (
    <div className={cn(S.viewport, bannerVisible && S.viewportWithBanner)}>
      {bannerVisible ? (
        <div className={S.welcomeBannerOuter}>
          <AppBanner onDismiss={() => setBannerVisible(false)}>
            Welcome, %userNname% 🎉 Your account is active! Make the most of
            Sybilion, <Link to="/docs/button">explore features →</Link>
          </AppBanner>
        </div>
      ) : null}
      <div className={S.pageScrollSlot}>
        <PageScroll className={S.root}>
          <AppShell>
            <DocsSidebar />

            <AppShellMainContent
              header={<AppHeaderHost sticky />}
              footer={
                <PageFooter
                  brandText="Sybilion Design"
                  versionLink="/releases"
                  versionLabel="1.0.0-docs"
                />
              }
            >
              <SybilionAppHeader
                pathname={location.pathname}
                onNavigate={href => {
                  void navigate(href);
                }}
                logo={<Logo brandText="Sybilion Design" />}
                authenticated
                isAuthenticated={false}
                onLogout={() => undefined}
                signInSlot={<ThemeToggle />}
                actionsEnd={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBannerVisible(current => !current)}
                  >
                    {bannerVisible ? 'Hide banner' : 'Show banner'}
                  </Button>
                }
                defaultApps={[
                  {
                    id: 'docs-home',
                    displayName: 'Home',
                    subtitle: 'Home',
                    iconKey: 'grid-four',
                    accent: '#0d9488',
                    accentMuted: 'rgba(13, 148, 136, 0.12)',
                    href: '/',
                    matchPathPrefixes: ['/'],
                  },
                ]}
              />
              <Outlet />
            </AppShellMainContent>
          </AppShell>
        </PageScroll>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SidebarProvider
      sidebarWidthStorageKey={DOCS_SIDEBAR_WIDTH_LS_KEY}
      persistSidebarWidthWithoutConsent
    >
      <ChatProvider
        userSwitchKey={DOCS_CHAT_USER_KEY}
        sendChatMessage={mockDocsSendChatMessage}
      >
        <Routes>
          <Route
            path="/"
            element={<Navigate to={`/docs/${DOC_DEFAULT_SLUG}`} replace />}
          />
          <Route path="/docs" element={<DocsLayout />}>
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

import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AppHeaderHost } from '#uilib/components/ui/AppHeader';
import { AppShell, AppShellMainContent } from '#uilib/components/ui/Page';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import { SybilionAppHeader } from '#uilib/components/widgets/SybilionAppHeader';
import { ThemeToggle } from '#uilib/docs/App/ThemeToggle';
import { DocsSidebar } from '#uilib/docs/components/DocsSidebar/DocsSidebar';

import S from './DocsShell.styl';

export function DocsShell() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <PageScroll className={S.root}>
      <AppShell>
        <DocsSidebar />

        <AppShellMainContent
          header={<AppHeaderHost sticky />}
          footer={
            <PageFooter versionLink="/releases" versionLabel="1.0.0-docs" />
          }
        >
          <SybilionAppHeader
            pathname={location.pathname}
            onNavigate={href => {
              void navigate(href);
            }}
            authenticated
            isAuthenticated={false}
            onLogout={() => undefined}
            signInSlot={<ThemeToggle />}
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
  );
}

import { PageContentSection } from '#uilib/components/ui/Page';
import { MiniAppRoot, useMiniAppShellTheme } from '#uilib/mini-app';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

function MiniAppThemeDemo() {
  const { theme } = useMiniAppShellTheme();

  return (
    <>
      <p style={{ margin: 0 }}>
        Context theme: <code>{theme.mode}</code>, isDarkMode:{' '}
        <code>{String(theme.isDarkMode)}</code>
      </p>
      <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
        Long content below — scroll should stay inside the mini-app shell (not
        only the docs page), matching iframe workspace apps.
      </p>
      {Array.from({ length: 36 }, (_, i) => (
        <p key={i} style={{ margin: 0, lineHeight: 1.6 }}>
          Block {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing
          elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua.
        </p>
      ))}
    </>
  );
}

export default function MiniAppRootPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'MiniAppRoot' }]}
        title="MiniAppRoot"
        subheader="Workspace mini-app shell: syncs document light/dark from parent THEME_SYNC postMessage, exposes theme via useMiniAppShellTheme. When embedded in Sybilion, child posts READY to parent; on this top-level docs page READY is skipped (no iframe parent)."
        actions={<DocsHeaderActions />}
      />
      <style>{`
        .mini-app-root-page {
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
          border-radius: var(--p-4);
        }
      `}</style>
      <PageContentSection style={{ maxHeight: '500px' }}>
        <MiniAppRoot appId="uilib-docs" className="mini-app-root-page">
          <MiniAppThemeDemo />
        </MiniAppRoot>
      </PageContentSection>
    </>
  );
}

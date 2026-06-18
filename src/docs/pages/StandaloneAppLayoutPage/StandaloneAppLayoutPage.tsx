import { useState } from 'react';

import { AppHeaderHost } from '#uilib/components/ui/AppHeader';
import { DropdownMenuItem } from '#uilib/components/ui/DropdownMenu';
import {
  AppShell,
  AppShellMainContent,
  PageContent,
  PageContentSection,
  PageHeader,
} from '#uilib/components/ui/Page';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import {
  Sidebar,
  SidebarContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '#uilib/components/ui/Sidebar/Sidebar';
import { SidebarDatasetsItemsGrouped } from '#uilib/components/widgets/SidebarDatasetsItemsGrouped';
import { SybilionAppHeader } from '#uilib/components/widgets/SybilionAppHeader';
import standaloneAppLayoutGuidance from '#uilib/docs/agent-guidance/standalone-app-layout.md';
import { GearSixIcon, UserCircleIcon } from '@phosphor-icons/react';
import { House } from 'lucide-react';

import { AppPageHeader } from '../../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../../docsHeaderActions';
import {
  DOCS_PREVIEW_APPS,
  DOCS_WORKSPACE_APPS_LS_KEY,
  MOCK_DATASETS,
  PreviewPanel,
  TEST_HEADER_ID,
} from './StandaloneAppLayoutPage.constants';
import S from './StandaloneAppLayoutPage.styl';

function DemoAppSidebar({
  panel,
  onSelectPanel,
  selectedDatasetId,
  onSelectDatasetId,
}: {
  panel: PreviewPanel;
  onSelectPanel: (p: PreviewPanel) => void;
  selectedDatasetId: number | undefined;
  onSelectDatasetId: (id: number | undefined) => void;
}) {
  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarContent>
        <SidebarDatasetsItemsGrouped
          preItems={
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                isActive={panel === 'home'}
                onClick={() => onSelectPanel('home')}
              >
                <House size={16} strokeWidth={1.75} aria-hidden />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
          }
          groupBy="regions"
          datasets={MOCK_DATASETS}
          selectedDatasetId={selectedDatasetId}
          onDatasetClick={id => {
            onSelectDatasetId(id);
            onSelectPanel('datasets');
          }}
        />
      </SidebarContent>
    </Sidebar>
  );
}

function DemoMainBody({ panel }: { panel: PreviewPanel }) {
  if (panel === 'home') {
    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: 'Home' }]}
          title="Home"
          subheader="Greenfield shell preview (no SDK or auth in this embed)."
        />
        <PageContent>
          <PageContentSection>
            <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
              Preview: greenfield shell layout only (no SDK or auth). Real SPA
              uses one top-level Router; this embed cannot nest MemoryRouter
              under docs BrowserRouter — sidebar uses local state instead of{' '}
              <code>NavLink</code> / <code>Routes</code>.
            </p>
          </PageContentSection>
        </PageContent>
      </>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Datasets' }]}
        title="Datasets"
        subheader="Sidebar + dataset list use local state (not Router)."
      />
      <PageContent>
        <PageContentSection>
          <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
            Use sidebar links and dataset rows; panel state stays inside this
            box.
          </p>
        </PageContentSection>
        <PageContentSection title="Scroll test">
          <div className={S.scrollTestBlock}>
            Placeholder region with <code>min-height: 160vh</code> — scroll the
            main column to verify PageScroll / AppShell behavior.
          </div>
        </PageContentSection>
      </PageContent>
    </>
  );
}

function StandaloneLayoutPreview() {
  const [panel, setPanel] = useState<PreviewPanel>('home');
  const [previewPath, setPreviewPath] = useState('/docs-preview/home');
  const [selectedDatasetId, setSelectedDatasetId] = useState<
    number | undefined
  >();

  return (
    <div className={S.preview} data-standalone-layout-preview>
      <SidebarProvider
        sidebarWidthStorageKey="uilib.docs.standaloneLayout.sidebarWidthPx"
        persistSidebarWidthWithoutConsent
      >
        <PageScroll rootClassName={S.previewScrollRoot}>
          <AppShell>
            <DemoAppSidebar
              panel={panel}
              onSelectPanel={setPanel}
              selectedDatasetId={selectedDatasetId}
              onSelectDatasetId={setSelectedDatasetId}
            />

            <AppShellMainContent
              header={<AppHeaderHost sticky anchorId={TEST_HEADER_ID} />}
              footer={
                <PageFooter
                  versionLink="#standalone-layout-preview"
                  versionLabel="0.0.0-preview"
                />
              }
            >
              <SybilionAppHeader
                pageHeaderId={TEST_HEADER_ID}
                pathname={previewPath}
                onNavigate={setPreviewPath}
                authenticated
                appsStorageKey={DOCS_WORKSPACE_APPS_LS_KEY}
                defaultApps={DOCS_PREVIEW_APPS}
                user={{
                  name: 'Example User',
                  email: 'user@example.com',
                  avatar: '',
                }}
                onLogout={() => undefined}
                menuItems={
                  <>
                    <DropdownMenuItem>
                      <UserCircleIcon />
                      Account (preview)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <GearSixIcon />
                      Settings (preview)
                    </DropdownMenuItem>
                  </>
                }
              />
              <DemoMainBody panel={panel} />
            </AppShellMainContent>
          </AppShell>
        </PageScroll>
      </SidebarProvider>
    </div>
  );
}

export default function StandaloneAppLayoutPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Standalone app layout' }]}
        title="Standalone app layout"
        subheader={
          <>
            Live preview of AppShell + Sidebar + main column. <br />
            Greenfield wiring: copy <code>mini/sybilion-app-template/</code> and
            follow its README — this page is layout only.
          </>
        }
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={standaloneAppLayoutGuidance} />
      <PageContentSection title="Embedded mini-app (layout preview)">
        <StandaloneLayoutPreview />
      </PageContentSection>
    </>
  );
}

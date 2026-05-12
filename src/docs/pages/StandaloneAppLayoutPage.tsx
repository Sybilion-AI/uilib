import { useCallback, useState } from 'react';

import { AppHeaderHost, AppHeaderPortal } from '#uilib/components/ui/AppHeader';
import { Gap } from '#uilib/components/ui/Gap/Gap';
import { NavUserHeader } from '#uilib/components/ui/NavUserHeader/NavUserHeader';
import {
  AppShell,
  AppShellMainContent,
  PageContentSection,
} from '#uilib/components/ui/Page';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '#uilib/components/ui/Sidebar/Sidebar';
import {
  SidebarDatasetsItemsGrouped,
  type SidebarDatasetsItemsGroupedDataset,
} from '#uilib/components/widgets/SidebarDatasetsItemsGrouped';
import { House } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './StandaloneAppLayoutPage.styl';

const MOCK_DATASETS: SidebarDatasetsItemsGroupedDataset[] = [
  {
    id: 1,
    name: 'Acetic Acid Price - China - Dollar/MT',
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-02',
    keywords: '',
    category: { id: 10, name: 'Chemicals' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 1, name: 'Asia' },
      { id: 2, name: 'China' },
    ],
    unit: { id: 1, name: 'USD/MT' },
  },
  {
    id: 2,
    name: 'Freight index — spot volume (China)',
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-02',
    keywords: '',
    category: { id: 10, name: 'Chemicals' },
    target_type_id: 2,
    target_type: { id: 2, name: 'Freight index' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 1, name: 'Asia' },
      { id: 2, name: 'China' },
    ],
    unit: { id: 1, name: 'Index' },
  },
  {
    id: 3,
    name: 'Ethanol Price Europe Per Kg In USD',
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-02',
    keywords: '',
    category: { id: 11, name: 'Energy' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 5, name: 'Europe' }],
    unit: { id: 1, name: 'USD/kg' },
  },
];

type PreviewPanel = 'home' | 'datasets';

const TEST_HEADER_ID = 'test-header-id';

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
    <Sidebar
      variant="inset"
      collapsible="offcanvas"
      style={{ maxHeight: '100%', height: '100%' }}
    >
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
      <div style={{ padding: 'var(--p-6)' }}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem' }}>Home</h2>
        <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
          Preview: greenfield shell layout only (no SDK or auth). Real SPA uses
          one top-level Router; this embed cannot nest MemoryRouter under docs
          BrowserRouter — sidebar uses local state instead of{' '}
          <code>NavLink</code> / <code>Routes</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--p-6)' }}>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem' }}>Datasets</h2>
      <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
        Use sidebar links and dataset rows; panel state stays inside this box.
      </p>
    </div>
  );
}

function StandaloneLayoutPreview() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [panel, setPanel] = useState<PreviewPanel>('home');
  const [selectedDatasetId, setSelectedDatasetId] = useState<
    number | undefined
  >();

  const onThemeToggle = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div className={S.preview}>
      <PageScroll rootClassName={S.previewScrollRoot}>
        <AppShell>
          <DemoAppSidebar
            panel={panel}
            onSelectPanel={setPanel}
            selectedDatasetId={selectedDatasetId}
            onSelectDatasetId={setSelectedDatasetId}
          />

          <AppShellMainContent
            header={<AppHeaderHost anchorId={TEST_HEADER_ID} />}
            footer={
              <PageFooter
                versionLink="#standalone-layout-preview"
                versionLabel="0.0.0-preview"
              />
            }
          >
            <AppHeaderPortal pageHeaderId={TEST_HEADER_ID}>
              <SidebarTrigger />
              <Gap />
              <NavUserHeader
                user={{
                  name: 'Preview User',
                  email: 'preview@example.com',
                  avatar: '',
                }}
                theme={theme}
                onThemeToggle={onThemeToggle}
                onLogout={() => undefined}
              />
            </AppHeaderPortal>
            <DemoMainBody panel={panel} />
          </AppShellMainContent>
        </AppShell>
      </PageScroll>
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
            Live preview of AppShell + Sidebar + main column from
            docs/standalone-apps.md §4. <br />
            Full greenfield setup (deps, global CSS, SybilionAuthProvider, SDK)
            lives in that doc — this page is layout only.
          </>
        }
        actions={<DocsHeaderActions />}
      />
      <PageContentSection title="Embedded mini-app (layout preview)">
        <SidebarProvider
          sidebarWidthStorageKey="uilib.docs.standaloneLayout.sidebarWidthPx"
          persistSidebarWidthWithoutConsent
        >
          <StandaloneLayoutPreview />
        </SidebarProvider>
      </PageContentSection>
    </>
  );
}

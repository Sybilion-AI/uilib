import { useCallback, useState } from 'react';

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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '#uilib/components/ui/Sidebar/Sidebar';
import type { WorkspaceAppEntry } from '#uilib/components/ui/WorkspaceAppSwitcher';
import {
  SidebarDatasetsItemsGrouped,
  type SidebarDatasetsItemsGroupedDataset,
} from '#uilib/components/widgets/SidebarDatasetsItemsGrouped';
import { SybilionAppHeader } from '#uilib/components/widgets/SybilionAppHeader';
import { GearSixIcon, UserCircleIcon } from '@phosphor-icons/react';
import { House } from 'lucide-react';

import { AppPageHeader } from '../../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../../docsHeaderActions';
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
  {
    id: 4,
    name: 'Brent Crude Oil — Front Month (ICE)',
    status: 'active',
    created_at: '2024-01-03',
    updated_at: '2024-01-04',
    keywords: '',
    category: { id: 11, name: 'Energy' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 5, name: 'Europe' }],
    unit: { id: 2, name: 'USD/bbl' },
  },
  {
    id: 5,
    name: 'WTI Crude — Cushing Spot',
    status: 'active',
    created_at: '2024-01-05',
    updated_at: '2024-01-06',
    keywords: '',
    category: { id: 11, name: 'Energy' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 3, name: 'North America' },
      { id: 4, name: 'United States' },
    ],
    unit: { id: 2, name: 'USD/bbl' },
  },
  {
    id: 6,
    name: 'Natural Gas Henry Hub — USD/MMBtu',
    status: 'active',
    created_at: '2024-01-07',
    updated_at: '2024-01-08',
    keywords: '',
    category: { id: 11, name: 'Energy' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 3, name: 'North America' },
      { id: 4, name: 'United States' },
    ],
    unit: { id: 3, name: 'USD/MMBtu' },
  },
  {
    id: 7,
    name: 'LNG JKM — Japan-Korea Marker',
    status: 'active',
    created_at: '2024-01-09',
    updated_at: '2024-01-10',
    keywords: '',
    category: { id: 11, name: 'Energy' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 1, name: 'Asia' },
      { id: 2, name: 'China' },
    ],
    unit: { id: 4, name: 'USD/MMBtu' },
  },
  {
    id: 8,
    name: 'Copper — LME Cash Official USD/MT',
    status: 'active',
    created_at: '2024-01-11',
    updated_at: '2024-01-12',
    keywords: '',
    category: { id: 12, name: 'Metals' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 5, name: 'Europe' }],
    unit: { id: 1, name: 'USD/MT' },
  },
  {
    id: 9,
    name: 'Aluminium — LME 3M USD/MT',
    status: 'active',
    created_at: '2024-01-13',
    updated_at: '2024-01-14',
    keywords: '',
    category: { id: 12, name: 'Metals' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 5, name: 'Europe' }],
    unit: { id: 1, name: 'USD/MT' },
  },
  {
    id: 10,
    name: 'Steel HRC — US Midwest ($/st)',
    status: 'active',
    created_at: '2024-01-15',
    updated_at: '2024-01-16',
    keywords: '',
    category: { id: 12, name: 'Metals' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 3, name: 'North America' },
      { id: 4, name: 'United States' },
    ],
    unit: { id: 5, name: 'USD/st' },
  },
  {
    id: 11,
    name: 'Urea FOB Middle East — Granular',
    status: 'active',
    created_at: '2024-01-17',
    updated_at: '2024-01-18',
    keywords: '',
    category: { id: 13, name: 'Agriculture' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 6, name: 'Middle East' }],
    unit: { id: 1, name: 'USD/MT' },
  },
  {
    id: 12,
    name: 'Corn — CBOT Nearby (cents/bu)',
    status: 'active',
    created_at: '2024-01-19',
    updated_at: '2024-01-20',
    keywords: '',
    category: { id: 13, name: 'Agriculture' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 3, name: 'North America' },
      { id: 4, name: 'United States' },
    ],
    unit: { id: 6, name: 'cents/bu' },
  },
  {
    id: 13,
    name: 'Soybeans — CBOT Nearby',
    status: 'active',
    created_at: '2024-01-21',
    updated_at: '2024-01-22',
    keywords: '',
    category: { id: 13, name: 'Agriculture' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [
      { id: 3, name: 'North America' },
      { id: 4, name: 'United States' },
    ],
    unit: { id: 7, name: 'USD/bu' },
  },
  {
    id: 14,
    name: 'Coffee Arabica — ICE NY',
    status: 'active',
    created_at: '2024-01-23',
    updated_at: '2024-01-24',
    keywords: '',
    category: { id: 13, name: 'Agriculture' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 8, name: 'Latin America' }],
    unit: { id: 8, name: 'USD/lb' },
  },
  {
    id: 15,
    name: 'Sugar #11 — ICE NY',
    status: 'active',
    created_at: '2024-01-25',
    updated_at: '2024-01-26',
    keywords: '',
    category: { id: 13, name: 'Agriculture' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 8, name: 'Latin America' }],
    unit: { id: 8, name: 'USD/lb' },
  },
  {
    id: 16,
    name: 'Polyethylene HDPE — CFR China',
    status: 'active',
    created_at: '2024-01-27',
    updated_at: '2024-01-28',
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
    id: 17,
    name: 'Methanol — CFR China',
    status: 'active',
    created_at: '2024-01-29',
    updated_at: '2024-01-30',
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
    id: 18,
    name: 'Charter rates — Panamax Atlantic',
    status: 'active',
    created_at: '2024-02-01',
    updated_at: '2024-02-02',
    keywords: '',
    category: { id: 10, name: 'Chemicals' },
    target_type_id: 2,
    target_type: { id: 2, name: 'Freight index' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 5, name: 'Europe' }],
    unit: { id: 1, name: 'Index' },
  },
  {
    id: 19,
    name: 'Container freight — Asia to US West Coast',
    status: 'active',
    created_at: '2024-02-03',
    updated_at: '2024-02-04',
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
    id: 20,
    name: 'Thermal Coal — Newcastle 6,000 kcal',
    status: 'active',
    created_at: '2024-02-05',
    updated_at: '2024-02-06',
    keywords: '',
    category: { id: 11, name: 'Energy' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 9, name: 'Oceania' }],
    unit: { id: 1, name: 'USD/MT' },
  },
  {
    id: 21,
    name: 'Diesel ARA — USD/MT',
    status: 'active',
    created_at: '2024-02-07',
    updated_at: '2024-02-08',
    keywords: '',
    category: { id: 11, name: 'Energy' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 5, name: 'Europe' }],
    unit: { id: 1, name: 'USD/MT' },
  },
  {
    id: 22,
    name: 'Propylene — Contract FD NWE',
    status: 'active',
    created_at: '2024-02-09',
    updated_at: '2024-02-10',
    keywords: '',
    category: { id: 10, name: 'Chemicals' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 5, name: 'Europe' }],
    unit: { id: 1, name: 'EUR/MT' },
  },
  {
    id: 23,
    name: 'Ammonia — CFR India',
    status: 'active',
    created_at: '2024-02-11',
    updated_at: '2024-02-12',
    keywords: '',
    category: { id: 10, name: 'Chemicals' },
    target_type_id: 1,
    target_type: { id: 1, name: 'Commodity price' },
    trend: 0,
    regular_price: '0',
    sale_price: '0',
    regions: [{ id: 1, name: 'Asia' }],
    unit: { id: 1, name: 'USD/MT' },
  },
];

type PreviewPanel = 'home' | 'datasets';

const TEST_HEADER_ID = 'test-header-id';

const DOCS_WORKSPACE_APPS_LS_KEY = 'uilib.docs.workspaceApps';

const DOCS_PREVIEW_APPS: WorkspaceAppEntry[] = [
  {
    id: 'docs-home',
    displayName: 'Datasets Dashboard',
    subtitle: 'Data analysis tools',
    iconKey: 'grid-four',
    accent: '#0d9488',
    accentMuted: 'rgba(13, 148, 136, 0.12)',
    href: '/docs-preview/home',
    matchPathPrefixes: ['/docs-preview/home'],
  },
  {
    id: 'docs-datasets',
    displayName: 'Datasets',
    subtitle: 'Dataset library',
    iconKey: 'package',
    accent: '#6366f1',
    accentMuted: 'rgba(99, 102, 241, 0.12)',
    href: '/docs-preview/datasets',
    matchPathPrefixes: ['/docs-preview/datasets'],
  },
  {
    id: 'my-custom-app',
    displayName: 'Custom app',
    subtitle: 'Slug-only app (sybilion.io/apps/…)',
    iconKey: 'boat',
    accent: '#0ea5e9',
    accentMuted: 'rgba(14, 165, 233, 0.12)',
    href: '/apps/my-custom-app',
  },
];

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
            Placeholder region with <code>min-height: 100vh</code> — scroll the
            main column to verify PageScroll / AppShell behavior.
          </div>
        </PageContentSection>
      </PageContent>
    </>
  );
}

function StandaloneLayoutPreview() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [panel, setPanel] = useState<PreviewPanel>('home');
  const [previewPath, setPreviewPath] = useState('/docs-preview/home');
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
            <SybilionAppHeader
              pageHeaderId={TEST_HEADER_ID}
              pathname={previewPath}
              onNavigate={setPreviewPath}
              authenticated
              appsStorageKey={DOCS_WORKSPACE_APPS_LS_KEY}
              defaultApps={DOCS_PREVIEW_APPS}
              user={{
                name: 'Preview User',
                email: 'preview@example.com',
                avatar: '',
              }}
              theme={theme}
              onThemeToggle={onThemeToggle}
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

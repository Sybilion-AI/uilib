import {
  AppHeader,
  PAGE_HEADER_ACTIONS_ID,
} from '#uilib/components/ui/AppHeader';
import { Button } from '#uilib/components/ui/Button';
import { PageContentSection } from '#uilib/components/ui/Page';
import {
  SidebarProvider,
  useSidebar,
} from '#uilib/components/ui/Sidebar/Sidebar';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const DOCS_APP_HEADER_PREVIEW_SIDEBAR_KEY = 'uilib-docs-app-header-preview';

function AppHeaderPreviewDemo() {
  const { isOpen, setOpen } = useSidebar();

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--color-background)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          fontSize: 13,
          color: 'var(--color-muted-foreground)',
        }}
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(!isOpen)}
        >
          Sidebar {isOpen ? 'open' : 'closed'} (toggle)
        </Button>
        <span>
          Header padding tracks sidebar state from an inner{' '}
          <code>SidebarProvider</code>.
        </span>
      </div>
      <AppHeader />
      <p style={{ margin: 0, padding: '12px 16px', fontSize: 13 }}>
        Portaled actions mount into the element with id{' '}
        <code>{PAGE_HEADER_ACTIONS_ID}</code>.
      </p>
    </div>
  );
}

export default function AppHeaderPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'AppHeader' }]}
        title="AppHeader"
        subheader="Top shell bar with anchor for portaled header actions; pairs with SidebarProvider."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection style={{ maxWidth: 720 }}>
        <SidebarProvider
          sidebarWidthStorageKey={DOCS_APP_HEADER_PREVIEW_SIDEBAR_KEY}
          persistSidebarWidthWithoutConsent
          defaultOpen
        >
          <AppHeaderPreviewDemo />
        </SidebarProvider>
      </PageContentSection>
    </>
  );
}

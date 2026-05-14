import { PageContentSection, PageTabs } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const SCROLL_TEST_ITEMS = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return {
    value: `scroll-demo-${n}`,
    label: `Tab ${n} — wider label`,
    content: (
      <p style={{ margin: 0, padding: '0 var(--page-x-padding)' }}>
        Content for tab {n}. Narrow container forces horizontal scroll on tab
        row.
      </p>
    ),
  };
});

export default function PageTabsPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'PageTabs' }]}
        title="PageTabs"
        subheader="Page-scoped tabs with horizontally scrollable tab strip."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '0.75rem' }}>Scrollable row (10 tabs)</h3>
          <p
            style={{
              marginBottom: '1rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Container capped at <code>280px</code> so tab triggers overflow and
            use <code>PageXScroll</code>.
          </p>
          <div
            style={{
              maxWidth: 500,
              border: '2px dashed var(--border)',
              borderRadius: 'var(--p-3)',
              backgroundColor: 'var(--background)',
            }}
          >
            <PageTabs
              defaultValue={SCROLL_TEST_ITEMS[0].value}
              items={SCROLL_TEST_ITEMS}
            />
          </div>
        </section>
      </PageContentSection>
    </>
  );
}

import { useState } from 'react';

import { Banner } from '#uilib/components/ui/Banner';
import { Button } from '#uilib/components/ui/Button';
import { PageContentSection } from '#uilib/components/ui/Page';
import { AlertTriangleIcon } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function BannerPage() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Banner' }]}
        title="Banner"
        subheader="Inline notice with optional icon and dismiss control."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Default</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Defaults to <code>InfoIcon</code>. Children can include text and
            links.
          </p>
          <Banner>
            Forecast refresh completed.{' '}
            <a href="#banner">View latest signals</a>
          </Banner>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Custom icon</h3>
          <Banner icon={AlertTriangleIcon}>
            Quota is almost reached. Upgrade before the next billing cycle.
          </Banner>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>No icon</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>{'icon={false}'}</code> to hide the leading icon.
          </p>
          <Banner icon={false}>Session expires in 15 minutes.</Banner>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Dismissible</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>onClose</code> to show a ghost close button.
          </p>
          {dismissed ? (
            <Button type="button" size="sm" onClick={() => setDismissed(false)}>
              Show banner
            </Button>
          ) : (
            <Banner onClose={() => setDismissed(true)}>
              New dataset columns are available. Review the mapping before
              refresh.
            </Banner>
          )}
        </section>
      </PageContentSection>
    </>
  );
}

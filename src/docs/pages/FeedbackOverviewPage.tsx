import { Banner } from '#uilib/components/ui/Banner';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Progress } from '#uilib/components/ui/Progress';
import { Skeleton } from '#uilib/components/ui/Skeleton';
import { TextShimmer } from '#uilib/components/ui/TextShimmer';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const PROGRESS_WIDTH = 320;

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: 'var(--p-3)',
  borderRadius: 'var(--radius-3)',
};

export default function FeedbackOverviewPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Overview' }]}
        title="Overview"
        subheader="Inline notices, progress, loading placeholders, and animated status text."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Banner</h3>
          <Banner>Forecast refresh completed.</Banner>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Progress</h3>
          <div style={panelStyle}>
            <Progress value={65} style={{ width: PROGRESS_WIDTH }} />
            <Progress style={{ width: PROGRESS_WIDTH }} />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Skeleton</h3>
          <div style={{ ...panelStyle, maxWidth: 320 }}>
            <Skeleton style={{ height: 14, width: '100%' }} />
            <Skeleton style={{ height: 14, width: '80%' }} />
            <Skeleton style={{ height: 80, width: '100%' }} />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>TextShimmer</h3>
          <div style={panelStyle}>
            <TextShimmer>Generating forecast…</TextShimmer>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}

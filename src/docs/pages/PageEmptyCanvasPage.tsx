import { Button } from '#uilib/components/ui/Button';
import {
  PageContent,
  PageContentSection,
  PageEmptyCanvas,
} from '#uilib/components/ui/Page';
import pageEmptyCanvasGuidance from '#uilib/components/ui/Page/PageEmptyCanvas/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const demoFrameStyle = {
  border: '2px dashed var(--border)',
  borderRadius: 'var(--p-3)',
  minHeight: 320,
  display: 'flex',
} as const;

export default function PageEmptyCanvasPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'PageEmptyCanvas' }]}
        title="PageEmptyCanvas"
        subheader="Centered empty state with title, hint, and optional CTA. Use when a route has no data yet."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={pageEmptyCanvasGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3>Title and hint</h3>
          <p
            style={{
              marginBottom: '1rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Minimal empty state: a short <code>title</code> plus a{' '}
            <code>hint</code> describing what to do next.
          </p>
          <div style={demoFrameStyle}>
            <PageEmptyCanvas
              title="No alerts yet"
              hint="When a news alert fires, it will appear here."
            />
          </div>
        </section>

        <section>
          <h3>Extended example</h3>
          <p
            style={{
              marginBottom: '1rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Real-world placement: render directly under <code>PageContent</code>
            ; the canvas centers and grows itself.
          </p>
          <div style={{ ...demoFrameStyle, minHeight: 360 }}>
            <PageContent variant="clean">
              <PageEmptyCanvas
                title="This workspace is empty"
                hint="Connect a data source to populate your dashboard with drivers and forecasts."
              >
                <Button type="button" variant="default">
                  Connect data source
                </Button>
                <a
                  href="https://sybilion.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn how to connect a data source
                </a>
              </PageEmptyCanvas>
            </PageContent>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}

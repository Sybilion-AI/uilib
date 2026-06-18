import { PageContentSection } from '#uilib/components/ui/Page';
import { Progress } from '#uilib/components/ui/Progress';
import progressGuidance from '#uilib/docs/agent-guidance/progress.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const VALUES = [0, 25, 50, 75, 100] as const;

const PROGRESS_WIDTH = 320;

export default function ProgressPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Progress' }]}
        title="Progress"
        subheader="Determinate fill at different completion values."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={progressGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Values</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>
                    value
                  </th>
                  <th style={{ padding: '0.5rem' }}>bar</th>
                </tr>
              </thead>
              <tbody>
                {VALUES.map(val => (
                  <tr key={val}>
                    <td
                      style={{
                        padding: '0.5rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {val}%
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <Progress value={val} style={{ width: PROGRESS_WIDTH }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Indeterminate</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Omit <code>value</code> or pass <code>0</code> for an empty track
            before progress is known.
          </p>
          <Progress style={{ width: PROGRESS_WIDTH }} />
        </section>
      </PageContentSection>
    </>
  );
}

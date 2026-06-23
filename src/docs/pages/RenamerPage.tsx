import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { Renamer } from '#uilib/components/ui/Renamer';
import renamerGuidance from '#uilib/components/ui/Renamer/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function RenamerPage() {
  const [smName, setSmName] = useState('Export settings');
  const [mdName, setMdName] = useState('Dataset name');
  const [lgName, setLgName] = useState('Release notes');
  const [lgLongName, setLgLongName] = useState(
    'Quarterly revenue forecast and variance analysis for North America',
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Renamer' }]}
        title="Renamer"
        subheader="Inline rename with pencil control — sm, md, and lg sizes."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={renamerGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Sizes</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Pass <code>size</code> for sm / md / lg. The pencil icon scales with
            the size; <code>lg</code> uses page-title typography.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div>
              <div
                style={{
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                sm
              </div>
              <Renamer value={smName} onChange={setSmName} size="sm">
                {smName}
              </Renamer>
            </div>
            <div>
              <div
                style={{
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                md
              </div>
              <Renamer value={mdName} onChange={setMdName} size="md">
                {mdName}
              </Renamer>
            </div>
            <div>
              <div
                style={{
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                lg
              </div>
              <Renamer value={lgName} onChange={setLgName} size="lg">
                {lgName}
              </Renamer>
            </div>
            <div>
              <div
                style={{
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                lg — wrapping title
              </div>
              <p
                style={{
                  marginBottom: '0.75rem',
                  color: 'var(--muted-foreground)',
                  fontSize: '0.875rem',
                }}
              >
                Long titles wrap; the pencil stays inline after the last line.
              </p>
              <div style={{ maxWidth: '20rem' }}>
                <Renamer value={lgLongName} onChange={setLgLongName} size="lg">
                  {lgLongName}
                </Renamer>
              </div>
            </div>
          </div>
        </section>
      </PageContentSection>
    </>
  );
}

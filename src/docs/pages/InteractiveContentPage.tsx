import { InteractiveContent } from '#uilib/components/ui/InteractiveContent';
import InteractiveContentGuidance from '#uilib/components/ui/InteractiveContent/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

type ShowcaseRow = {
  label: string;
  source: string;
  variant?: 'full' | 'inline';
};

const SHOWCASE_ROWS: ShowcaseRow[] = [
  {
    label: 'Bold (markdown)',
    source: 'Use **bold** for emphasis.',
  },
  {
    label: 'Bold (HTML)',
    source: 'Use <strong>bold</strong> for emphasis.',
  },
  {
    label: 'Italic (markdown)',
    source: 'Use *italic* or _italic_ for emphasis.',
  },
  {
    label: 'Code (HTML)',
    source: 'Restored <code>?prompt=</code> URLs for chat deep links.',
    variant: 'inline',
  },
  {
    label: 'Code (backticks)',
    source: 'Pass `?prompt=` in the query string.',
    variant: 'inline',
  },
  {
    label: 'Markdown link',
    source: 'Read the [release notes](/releases) for details.',
  },
  {
    label: 'HTML link',
    source: 'Read the <a href="/releases">release notes</a> for details.',
  },
  {
    label: 'Autolink URL',
    source: 'See https://example.com/docs for more context.',
  },
  {
    label: 'Combined inline',
    source:
      '<strong>Chat deep links.</strong> Restored <code>?prompt=</code> URLs. See https://example.com/help.',
    variant: 'inline',
  },
];

const FULL_VARIANT_SAMPLE = `# Section title

- **First item.** With *italic* detail.
- Second item with \`inline code\` and a [link](/settings).`;

export default function InteractiveContentPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'InteractiveContent' }]}
        title="InteractiveContent"
        subheader="Inline formatting from assistant-style text."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={InteractiveContentGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        {SHOWCASE_ROWS.map(row => (
          <section key={row.label}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              {row.label}
            </h3>
            <p
              style={{
                margin: '0 0 0.5rem',
                fontSize: '0.75rem',
                color: 'var(--muted-foreground)',
              }}
            >
              <code>{row.source}</code>
            </p>
            <InteractiveContent text={row.source} variant={row.variant} />
          </section>
        ))}
      </PageContentSection>
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <h3 style={{ fontSize: '0.875rem' }}>Full variant (default)</h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)',
          }}
        >
          Supports headings, markdown bullets (<code>- item</code>), and the
          same inline formats.
        </p>
        <InteractiveContent text={FULL_VARIANT_SAMPLE} />
      </PageContentSection>
    </>
  );
}

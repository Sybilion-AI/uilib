import { InteractiveContent } from '#uilib/components/ui/InteractiveContent';
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
      <DocsGuidance
        overview="InteractiveContent renders assistant-style plain text with inline formatting: bold and italic emphasis, inline code via <code> tags or backticks, markdown and HTML links, and bare URLs converted into clickable links. The inline variant omits block-level features such as headings and markdown bullets."
        whenToUse={[
          'To display assistant or model-generated text that may contain markdown emphasis and raw URLs.',
          'For release note bullets and other compact labels that need lightweight inline formatting.',
          'When plain text needs lightweight formatting without a full markdown renderer.',
        ]}
        whenNotToUse={[
          'For trusted, authored content with rich structure such as headings, lists, or code blocks; use a full markdown component.',
          'For static UI copy that needs no formatting; render the text directly.',
        ]}
        doNotes={[
          'Use the inline variant when the text sits inside a sentence, list item, or compact label.',
          'In release notes markdown, write list bullets as "- item text" in the source file; the parser strips the leading "- " and renders each item inside a list — do not repeat "- " inside the item string.',
          'Wrap inline code with <code>…</code> or backticks (`…`); both render as monospace code.',
        ]}
      />
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

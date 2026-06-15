import { InteractiveContent } from '#uilib/components/ui/InteractiveContent';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const SAMPLE =
  'Use **bold** and *italic* in formatted text. See https://www.theguardian.com/business/ng-interactive/2026/may/14/us-stock-market-war-inflation-tariffs-trump for context.';

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
        overview="InteractiveContent renders assistant-style plain text with inline formatting applied: markdown emphasis such as bold and italic, and bare URLs converted into clickable links. The inline variant restricts formatting to what is safe within a single line."
        whenToUse={[
          'To display assistant or model-generated text that may contain markdown emphasis and raw URLs.',
          'When plain text needs lightweight formatting without a full markdown renderer.',
        ]}
        whenNotToUse={[
          'For trusted, authored content with rich structure such as headings, lists, or code blocks; use a full markdown component.',
          'For static UI copy that needs no formatting; render the text directly.',
        ]}
        doNotes={[
          'Use the inline variant when the text sits inside a sentence or compact label.',
        ]}
      />
      <PageContentSection>
        <InteractiveContent text={SAMPLE} />
      </PageContentSection>
    </>
  );
}

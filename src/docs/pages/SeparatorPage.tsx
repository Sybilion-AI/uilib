import { PageContentSection } from '#uilib/components/ui/Page';
import { Separator } from '#uilib/components/ui/Separator';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SeparatorPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Separator' }]}
        title="Separator"
        subheader="Horizontal rule."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Separator draws a thin horizontal rule that visually divides adjacent content. It is purely presentational and carries no semantics of its own."
        whenToUse={[
          'To divide groups of related content within a card, menu, or panel.',
          'Between repeated rows or sections where whitespace alone is not enough.',
        ]}
        whenNotToUse={[
          'Between top-level page sections; rely on PageContentSection spacing instead.',
          'When grouping can be expressed with headings or spacing alone; avoid unnecessary lines.',
        ]}
      />
      <PageContentSection>
        <p style={{ margin: 0 }}>Above</p>
        <Separator style={{ margin: '12px 0' }} />
        <p style={{ margin: 0 }}>Below</p>
      </PageContentSection>
    </>
  );
}

import { PageContent, PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function PagePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Page' }]}
        title="Page"
        subheader="PageContent and PageContentSection layout helpers."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="PageContent and PageContentSection are the structural building blocks of a page body. PageContent wraps the whole body and applies the page width cap, while each PageContentSection forms a vertical section that owns the horizontal page padding."
        whenToUse={[
          'On every authenticated page, directly below the page header, to structure the body.',
          'To split a page into vertical sections with consistent spacing and padding.',
        ]}
        whenNotToUse={[
          'Inside cards or other components; sections are page-level structure, not generic containers.',
          'Nested within another PageContentSection.',
        ]}
        doNotes={[
          'Place all body content inside at least one PageContentSection so page padding stays consistent.',
        ]}
      />
      <PageContent>
        <PageContentSection>
          <p style={{ margin: 0 }}>First section content.</p>
        </PageContentSection>
        <PageContentSection>
          <p style={{ margin: 0 }}>Second section content.</p>
        </PageContentSection>
      </PageContent>
    </>
  );
}

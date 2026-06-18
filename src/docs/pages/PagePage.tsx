import { PageContent, PageContentSection } from '#uilib/components/ui/Page';
import pageGuidance from '#uilib/docs/agent-guidance/page.md';

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
      <DocsGuidance source={pageGuidance} />
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

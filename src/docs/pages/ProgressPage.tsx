import { PageContentSection } from '#uilib/components/ui/Page';
import { Progress } from '#uilib/components/ui/Progress';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function ProgressPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Progress' }]}
        title="Progress"
        subheader="Progress bar."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <Progress value={45} style={{ maxWidth: 320 }} />
      </PageContentSection>
    </>
  );
}

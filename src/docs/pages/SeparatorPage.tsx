import { PageContentSection } from '#uilib/components/ui/Page';
import { Separator } from '#uilib/components/ui/Separator';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
      <PageContentSection>
        <p style={{ margin: 0 }}>Above</p>
        <Separator style={{ margin: '12px 0' }} />
        <p style={{ margin: 0 }}>Below</p>
      </PageContentSection>
    </>
  );
}

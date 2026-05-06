import { Logo } from '#uilib/components/ui/Logo';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function LogoPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Logo' }]}
        title="Logo"
        subheader="Brand mark with optional wordmark."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}
      >
        <Logo size="sm" />
        <Logo size="md" />
        <Logo size="lg" showText={false} />
      </PageContentSection>
    </>
  );
}

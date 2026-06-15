import { Logo } from '#uilib/components/ui/Logo';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance
        overview="Logo renders the brand mark with an optional wordmark. Choose a size that fits the surrounding chrome and hide the text with showText={false} where space is tight."
        whenToUse={[
          'In application chrome such as the sidebar header, top navigation, or sign-in screens.',
          'Anywhere the product brand needs consistent, pre-sized rendering.',
        ]}
        whenNotToUse={[
          'For decorative imagery or illustrations; the logo is reserved for brand identity.',
          'When you need arbitrary sizing; stick to the provided size presets for consistency.',
        ]}
        doNotes={[
          'Use showText={false} in collapsed or icon-only contexts such as a rail sidebar.',
        ]}
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

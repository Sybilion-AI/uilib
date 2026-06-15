import { PageContentSection } from '#uilib/components/ui/Page';
import { Skeleton } from '#uilib/components/ui/Skeleton';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SkeletonPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Skeleton' }]}
        title="Skeleton"
        subheader="Loading placeholder."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Skeleton is a loading placeholder that reserves space for content while it loads. Compose simple shapes — lines and blocks — to mirror the layout of the content that will eventually appear."
        whenToUse={[
          'While fetching data for content whose layout is known in advance, such as cards, lists, or text blocks.',
          'To reduce layout shift by holding the space the real content will occupy.',
          'When loading takes long enough that an empty area would feel broken.',
        ]}
        whenNotToUse={[
          'For very fast operations where the skeleton would only flash briefly.',
          'For indeterminate background work with no incoming content; use a spinner or progress indicator instead.',
        ]}
        doNotes={[
          'Match skeleton shapes to the dimensions of the real content so the swap feels seamless.',
        ]}
      />
      <PageContentSection
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 320,
        }}
      >
        <Skeleton style={{ height: 14, width: '100%' }} />
        <Skeleton style={{ height: 14, width: '80%' }} />
        <Skeleton style={{ height: 80, width: '100%' }} />
      </PageContentSection>
    </>
  );
}

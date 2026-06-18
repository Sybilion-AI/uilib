import { PageContentSection } from '#uilib/components/ui/Page';
import { Skeleton } from '#uilib/components/ui/Skeleton';
import skeletonGuidance from '#uilib/docs/agent-guidance/skeleton.md';

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
      <DocsGuidance source={skeletonGuidance} />
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

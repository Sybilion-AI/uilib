import { Badge } from '#uilib/components/ui/Badge';
import BadgeGuidance from '#uilib/components/ui/Badge/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function BadgePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Badge' }]}
        title="Badge"
        subheader="Status and label badges."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={BadgeGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
      >
        <Badge>Default</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="red">Red</Badge>
        <Badge variant="green">Green</Badge>
        <Badge squared>Squared</Badge>
      </PageContentSection>
    </>
  );
}

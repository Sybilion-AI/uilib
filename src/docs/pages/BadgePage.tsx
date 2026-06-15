import { Badge } from '#uilib/components/ui/Badge';
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
      <DocsGuidance
        overview="Badges are compact labels that highlight a status, category, or count. Choose a variant that matches the meaning: default or outline for neutral labels, red and green for negative and positive states."
        whenToUse={[
          'To show the status of an item, such as active, failed, or done.',
          'To label or categorise content in lists, tables, and cards.',
          'To surface short metadata next to a title.',
        ]}
        whenNotToUse={[
          'For interactive actions; badges are not clickable, use Button instead.',
          'For long descriptive text; keep badge labels to one or two words.',
        ]}
        doNotes={[
          'Use colour variants consistently so a given colour always carries the same meaning across the product.',
        ]}
      />
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

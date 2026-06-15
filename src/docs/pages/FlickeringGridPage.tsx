import { FlickeringGrid } from '#uilib/components/ui/FlickeringGrid';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function FlickeringGridPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'FlickeringGrid' }]}
        title="FlickeringGrid"
        subheader="Decorative animated grid background."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="FlickeringGrid is a purely decorative animated grid of squares that flicker at random. Place it behind content in a positioned container to add subtle visual texture to hero areas or empty states."
        whenToUse={[
          'As a background flourish on landing, sign-in, or marketing-style surfaces.',
          'To add ambient motion to an otherwise static empty state.',
        ]}
        whenNotToUse={[
          'Behind dense data displays such as charts or tables, where motion competes with the content.',
          'When users may prefer reduced motion; avoid relying on it to convey any meaning.',
        ]}
        dontNotes={[
          'Do not attach interactive behaviour to the grid; it is decoration only.',
        ]}
      />
      <PageContentSection
        style={{ height: 200, position: 'relative', overflow: 'hidden' }}
      >
        <FlickeringGrid className="" />
      </PageContentSection>
    </>
  );
}

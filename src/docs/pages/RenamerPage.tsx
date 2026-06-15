import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { Renamer } from '#uilib/components/ui/Renamer';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function RenamerPage() {
  const [name, setName] = useState('Dataset name');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Renamer' }]}
        title="Renamer"
        subheader="Inline rename with pencil control."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Renamer wraps a displayed name with an inline rename affordance: a pencil control switches the text into an editable field and commits the new value through onChange. The children render the current display state."
        whenToUse={[
          'To let users rename an entity, such as a dataset or report, in place without a dialog.',
          'In headers or list rows where the name is the primary editable property.',
        ]}
        whenNotToUse={[
          'For multi-field editing; open a form or dialog instead.',
          'When renaming requires validation feedback or confirmation before saving.',
        ]}
        doNotes={[
          'Persist the new name in onChange and reflect it back in value so the display stays in sync.',
        ]}
      />
      <PageContentSection>
        <Renamer value={name} onChange={setName}>
          {name}
        </Renamer>
      </PageContentSection>
    </>
  );
}

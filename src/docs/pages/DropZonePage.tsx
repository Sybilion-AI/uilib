import { useState } from 'react';

import { DropZone } from '#uilib/components/ui/DropZone/DropZone';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function DropZonePage() {
  const [name, setName] = useState<string | null>(null);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'DropZone' }]}
        title="DropZone"
        subheader="Drag and drop or pick a file."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="DropZone is a file upload target that accepts a dragged file or opens the system file picker on click. Restrict accepted types with the accept prop and receive the chosen file in the onFile callback."
        whenToUse={[
          'When uploading a file is a primary step in a flow, such as importing a dataset.',
          'When drag and drop is a natural interaction, for example on desktop-focused screens.',
        ]}
        whenNotToUse={[
          'In compact layouts where a large drop target wastes space; use a simple file input or button instead.',
          'When users need to manage multiple attachments inline; pair an upload control with FileChip rows.',
        ]}
        doNotes={[
          'Set accept to the formats you can actually process, and repeat them in the label so expectations are clear.',
          'Show the selected file name after a drop so users get immediate confirmation.',
        ]}
      />
      <PageContentSection>
        <DropZone
          accept=".csv,.txt"
          label="Drop a .csv or .txt file here"
          onFile={file => setName(file.name)}
        />
        {name ? (
          <p style={{ marginTop: 12, fontSize: 14 }}>Selected: {name}</p>
        ) : null}
      </PageContentSection>
    </>
  );
}

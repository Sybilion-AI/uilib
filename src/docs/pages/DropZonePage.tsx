import { useState } from 'react';

import DropZoneGuidance from '#uilib/components/ui/DropZone/AGENT.md';
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
      <DocsGuidance source={DropZoneGuidance} />
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

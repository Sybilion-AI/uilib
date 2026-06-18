import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { Renamer } from '#uilib/components/ui/Renamer';
import renamerGuidance from '#uilib/docs/agent-guidance/renamer.md';

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
      <DocsGuidance source={renamerGuidance} />
      <PageContentSection>
        <Renamer value={name} onChange={setName}>
          {name}
        </Renamer>
      </PageContentSection>
    </>
  );
}

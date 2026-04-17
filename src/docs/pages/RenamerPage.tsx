import { useState } from 'react';

import { Renamer } from '#uilib/components/ui/Renamer';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
      <Renamer value={name} onChange={setName}>
        {name}
      </Renamer>
    </>
  );
}

import { useState } from 'react';

import { NumberControl } from '#uilib/components/ui/NumberControl';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function NumberControlPage() {
  const [v, setV] = useState(1);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'NumberControl' }]}
        title="NumberControl"
        subheader="Stepper with minus / plus."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <NumberControl value={v} onChange={setV} min={0} max={10} step={0.5} />
      </PageContentSection>
    </>
  );
}

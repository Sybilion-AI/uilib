import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { ToggleGroup, ToggleGroupItem } from '#uilib/components/ui/ToggleGroup';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function ToggleGroupPage() {
  const [v, setV] = useState('left');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'ToggleGroup' }]}
        title="ToggleGroup"
        subheader="Single-select group."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <ToggleGroup
          type="single"
          value={v}
          onValueChange={val => {
            if (val) setV(val);
          }}
        >
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </PageContentSection>
    </>
  );
}

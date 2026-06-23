import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { ToggleGroup, ToggleGroupItem } from '#uilib/components/ui/ToggleGroup';
import toggleGroupGuidance from '#uilib/components/ui/ToggleGroup/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance source={toggleGroupGuidance} />
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

import { useState } from 'react';

import { MobileAdaptiveSelector } from '#uilib/components/ui/MobileAdaptiveSelector';
import MobileAdaptiveSelectorGuidance from '#uilib/components/ui/MobileAdaptiveSelector/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const ITEMS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

export default function MobileAdaptiveSelectorPage() {
  const [value, setValue] = useState('a');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'MobileAdaptiveSelector' }]}
        title="MobileAdaptiveSelector"
        subheader="Toggle group on desktop, select on mobile (or many items)."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={MobileAdaptiveSelectorGuidance} />
      <PageContentSection>
        <MobileAdaptiveSelector
          value={value}
          onChange={setValue}
          items={ITEMS}
          isDropdown={false}
        />
      </PageContentSection>
    </>
  );
}

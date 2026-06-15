import { useState } from 'react';

import { MobileAdaptiveSelector } from '#uilib/components/ui/MobileAdaptiveSelector';
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
      <DocsGuidance
        overview="MobileAdaptiveSelector presents a single-choice control that renders as a toggle group on desktop and switches to a select dropdown on mobile, or whenever the item list is too long for a row of toggles. It keeps one value and onChange contract across both presentations."
        whenToUse={[
          'To switch between a small set of mutually exclusive options that must stay usable on narrow viewports.',
          'For view or mode switchers, such as grouping or time-range pickers, that appear in responsive layouts.',
        ]}
        whenNotToUse={[
          'For multi-select choices; use a checkbox group or multi-select instead.',
          'When the presentation must stay fixed across breakpoints; use ToggleGroup or Select directly.',
        ]}
        doNotes={[
          'Keep labels short so the desktop toggle row does not overflow.',
        ]}
      />
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

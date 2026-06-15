import { useState } from 'react';

import { NumberControl } from '#uilib/components/ui/NumberControl';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
      <DocsGuidance
        overview="NumberControl is a numeric stepper with minus and plus buttons for adjusting a value within a bounded range. Configure min, max, and step to control the allowed values."
        whenToUse={[
          'To adjust a numeric value in small, predictable increments, such as a quantity or threshold.',
          'When the valid range is narrow and stepping is faster than typing.',
        ]}
        whenNotToUse={[
          'For values with a wide range or many decimal places; use a plain number input instead.',
          'For picking one of a few discrete options; use Select or ToggleGroup.',
        ]}
        doNotes={[
          'Always set min and max so the control cannot step out of the valid range.',
        ]}
      />
      <PageContentSection>
        <NumberControl value={v} onChange={setV} min={0} max={10} step={0.5} />
      </PageContentSection>
    </>
  );
}

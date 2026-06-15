import { useState } from 'react';

import { LabeledInput } from '#uilib/components/ui/LabeledInput/LabeledInput';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function LabeledInputPage() {
  const [value, setValue] = useState('');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'LabeledInput' }]}
        title="LabeledInput"
        subheader="Label + input row."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="LabeledInput combines a Label and an Input into a single row, wiring the label to the field automatically via the id you provide. It accepts the usual input props such as name, value, onChange, and placeholder."
        whenToUse={[
          'For standard form fields where every input needs a visible, associated label.',
          'To keep label and input markup consistent across forms without repeating the wiring.',
        ]}
        whenNotToUse={[
          'When the field needs a custom layout, helper text, or validation message; compose Label and Input directly.',
          'For non-text controls such as switches or selects, which have their own labelling patterns.',
        ]}
      />
      <PageContentSection>
        <LabeledInput
          id="labeled-docs"
          name="demo"
          label="Field"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Value"
        />
      </PageContentSection>
    </>
  );
}

import { useState } from 'react';

import { LabeledInput } from '#uilib/components/ui/LabeledInput/LabeledInput';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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

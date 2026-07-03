import RadioGroupGuidance from '#uilib/components/ui/RadioGroup/AGENT.md';
import { RadioGroupExample } from '#uilib/components/ui/RadioGroup/RadioGroup.example';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function RadioGroupPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'RadioGroup' }]}
        title="RadioGroup"
        subheader="Single-choice control for mutually exclusive options."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={RadioGroupGuidance} />
      <RadioGroupExample />
    </>
  );
}

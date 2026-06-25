import FormGuidance from '#uilib/components/ui/Form/AGENT.md';
import { FormExample } from '#uilib/components/ui/Form/Form.example';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function FormPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Form' }]}
        title="Form"
        subheader="Validated forms with react-hook-form and zod."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={FormGuidance} />
      <FormExample />
    </>
  );
}

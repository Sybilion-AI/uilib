import { Checkbox } from '#uilib/components/ui/Checkbox';
import CheckboxGuidance from '#uilib/components/ui/Checkbox/AGENT.md';
import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function CheckboxPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Checkbox' }]}
        title="Checkbox"
        subheader="Binary control for selecting an option."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={CheckboxGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--p-2)',
            padding: 'var(--p-2)',
            background: 'var(--background)',
            borderRadius: 'var(--radius-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox id="cb-default" />
            <Label htmlFor="cb-default">Option</Label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox id="cb-disabled" disabled />
            <Label htmlFor="cb-disabled">Option</Label>
          </div>
        </div>
      </PageContentSection>
    </>
  );
}

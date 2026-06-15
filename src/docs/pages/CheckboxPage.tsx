import { Checkbox } from '#uilib/components/ui/Checkbox';
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
      <DocsGuidance
        overview="Checkbox is a binary control for selecting or deselecting an option. Pair it with a Label linked via htmlFor so the text is clickable and announced by assistive technology."
        whenToUse={[
          'For independent on or off options in forms and settings.',
          'To select multiple items from a list.',
          'To record agreement, such as accepting terms.',
        ]}
        whenNotToUse={[
          'For an action that takes effect immediately; use Switch instead.',
          'For mutually exclusive choices; use RadioGroup.',
        ]}
        doNotes={[
          'Write labels positively, such as “Send notifications” rather than “Do not send notifications”.',
        ]}
      />
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

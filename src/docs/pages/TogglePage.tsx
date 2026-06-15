import { PageContentSection } from '#uilib/components/ui/Page';
import { Toggle } from '#uilib/components/ui/Toggle';
import { Bold } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function TogglePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Toggle' }]}
        title="Toggle"
        subheader="Pressable toggle (two-state)."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Toggle is a two-state button that can be pressed or unpressed, typically showing an icon. It suits tool-style options that users switch on and off in place, such as text formatting."
        whenToUse={[
          'For tool options in editors and toolbars, such as bold or italic formatting.',
          'When a single independent option is switched on and off and the pressed state is the feedback.',
        ]}
        whenNotToUse={[
          'For settings that take effect immediately in a settings list; use Switch instead.',
          'For mutually exclusive options; use ToggleGroup instead.',
        ]}
        doNotes={['Provide an aria-label when the toggle shows only an icon.']}
      />
      <PageContentSection>
        <Toggle aria-label="Bold" size="sm">
          <Bold size={16} />
        </Toggle>
      </PageContentSection>
    </>
  );
}

import { PageContentSection } from '#uilib/components/ui/Page';
import { Toggle } from '#uilib/components/ui/Toggle';
import toggleGuidance from '#uilib/components/ui/Toggle/AGENT.md';
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
      <DocsGuidance source={toggleGuidance} />
      <PageContentSection>
        <Toggle aria-label="Bold" size="sm">
          <Bold size={16} />
        </Toggle>
      </PageContentSection>
    </>
  );
}

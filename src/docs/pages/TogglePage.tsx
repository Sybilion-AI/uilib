import { Toggle } from '#uilib/components/ui/Toggle';
import { Bold } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
      <Toggle aria-label="Bold" size="sm">
        <Bold size={16} />
      </Toggle>
    </>
  );
}

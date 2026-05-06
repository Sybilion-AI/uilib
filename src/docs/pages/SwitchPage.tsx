import { useState } from 'react';

import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Switch } from '#uilib/components/ui/Switch';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SwitchPage() {
  const [on, setOn] = useState(false);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Switch' }]}
        title="Switch"
        subheader="Toggle switch."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <Switch id="sw" checked={on} onCheckedChange={setOn} />
        <Label htmlFor="sw">{on ? 'On' : 'Off'}</Label>
      </PageContentSection>
    </>
  );
}

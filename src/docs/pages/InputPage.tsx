import { useState } from 'react';

import { Input } from '#uilib/components/ui/Input';
import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function InputPage() {
  const [v, setV] = useState('');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Input' }]}
        title="Input"
        subheader="Text input."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 320,
        }}
      >
        <Label htmlFor="in">Label</Label>
        <Input
          id="in"
          value={v}
          onChange={e => setV(e.target.value)}
          placeholder="Type…"
        />
      </PageContentSection>
    </>
  );
}

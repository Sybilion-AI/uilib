import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { Slider } from '#uilib/components/ui/Slider';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SliderPage() {
  const [v, setV] = useState([40]);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Slider' }]}
        title="Slider"
        subheader="Range input."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection style={{ maxWidth: 360 }}>
        <Slider value={v} onValueChange={setV} max={100} step={1} />
        <p style={{ marginTop: 8, fontSize: 14 }}>Value: {v[0]}</p>
      </PageContentSection>
    </>
  );
}

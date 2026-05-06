import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { RegionSelector } from '#uilib/components/ui/RegionCoords';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const REGIONS = {
  NYC: { longitude: -74.006, latitude: 40.7128 },
  London: { longitude: -0.1276, latitude: 51.5074 },
};

export default function RegionCoordsPage() {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'RegionCoords' }]}
        title="RegionCoords"
        subheader="RegionSelector — pick a region from map coordinates."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <RegionSelector
          regions={REGIONS}
          onSelect={(name, coords) => {
            setPicked(
              `${name}: ${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
            );
          }}
        >
          <span style={{ marginRight: 8 }}>Map region</span>
        </RegionSelector>
        {picked ? <p style={{ marginTop: 12 }}>{picked}</p> : null}
      </PageContentSection>
    </>
  );
}

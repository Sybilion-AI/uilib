import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { Switch } from '#uilib/components/ui/Switch';
import {
  type DriverData,
  DriverMap,
} from '#uilib/components/widgets/DriverMap';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const MOCK_DRIVERS: DriverData[] = [
  {
    id: 'd1',
    name: 'EU industrial production',
    region: ['Europe', 'Germany'],
    category: 'Manufacturing',
    isPublic: true,
    importance: 88,
    direction: 0.4,
    lag: '2 month(s)',
    coordinates: { x: 48, y: 34, continent: 'Europe' },
  },
  {
    id: 'd2',
    name: 'US housing starts',
    region: ['North America', 'United States of America'],
    category: 'Housing',
    isPublic: true,
    importance: 72,
    direction: -0.2,
    lag: '1 month(s)',
    coordinates: { x: 22, y: 36, continent: 'North America' },
  },
  {
    id: 'd3',
    name: 'Japan export volumes',
    region: ['Asia', 'Japan'],
    category: 'Trade',
    isPublic: true,
    importance: 65,
    direction: 0.1,
    lag: '3 month(s)',
    coordinates: { x: 78, y: 38, continent: 'Asia' },
  },
  {
    id: 'd4',
    name: 'Global risk appetite',
    region: ['World'],
    category: 'market',
    isPublic: true,
    importance: 55,
    direction: 0,
    lag: 'Unknown',
    coordinates: { x: 50, y: 50, continent: 'Global' },
  },
];

export default function DriverMapPage() {
  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(
    MOCK_DRIVERS[0],
  );
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'DriverMap' }]}
        title="DriverMap"
        subheader="World map with driver badges, transitions, and keyboard navigation (arrow keys)."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Switch
            id="loading-overlay"
            checked={isLoading}
            onCheckedChange={setIsLoading}
          />
          <label htmlFor="loading-overlay">Loading overlay</label>
        </div>
        <div
          style={{
            width: 720,
            maxWidth: '100%',
            '--shimmer-color': 'var(--page-color)',
          }}
        >
          <DriverMap
            drivers={MOCK_DRIVERS}
            isLoading={isLoading}
            selectedDriver={selectedDriver}
            setSelectedDriver={setSelectedDriver}
          />
        </div>
        {selectedDriver ? (
          <p style={{ marginTop: 16, fontSize: 14 }}>
            Selected: <strong>{selectedDriver.name}</strong> (
            {selectedDriver.id})
          </p>
        ) : null}
      </PageContentSection>
    </>
  );
}

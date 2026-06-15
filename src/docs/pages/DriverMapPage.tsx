import { useState } from 'react';

import { PageColumns, PageContentSection } from '#uilib/components/ui/Page';
import { Switch } from '#uilib/components/ui/Switch';
import { DriverCard } from '#uilib/components/widgets/DriverCard';
import {
  type DriverData,
  DriverMap,
  getPreciseCoordinates,
} from '#uilib/components/widgets/DriverMap';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

/** ISO `YYYY-MM` keys, sorted ascending → series for DriverPerformanceChart. */
function buildMonthlySeries(
  seed: number,
  months: number,
  drift = 0.15,
): NonNullable<DriverData['normalized_series']> {
  const out: NonNullable<DriverData['normalized_series']> = {};
  const start = new Date('2019-01-01');
  for (let i = 0; i < months; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    const key = d.toISOString().slice(0, 7);
    out[key] =
      seed + Math.sin(i * 0.35) * 14 + Math.cos(i * 0.11) * 7 + i * drift;
  }
  return out;
}

function DriverPager({
  drivers,
  selectedDriver,
  onSelect,
}: {
  drivers: DriverData[];
  selectedDriver: DriverData | null;
  onSelect: (d: DriverData | null) => void;
}) {
  const index = selectedDriver
    ? drivers.findIndex(d => d.id === selectedDriver.id)
    : -1;
  const total = drivers.length;
  const safeIndex = index >= 0 ? index : 0;
  const displayIndex = index >= 0 ? index + 1 : 0;

  const go = (nextIdx: number) => {
    if (total === 0) {
      onSelect(null);
      return;
    }
    const wrapped = ((nextIdx % total) + total) % total;
    onSelect(drivers[wrapped] ?? null);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'var(--muted-foreground)',
      }}
    >
      <button
        type="button"
        aria-label="Previous driver"
        disabled={total === 0 || !selectedDriver}
        onClick={() => go(safeIndex - 1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          borderRadius: 6,
          border: '1px solid var(--border)',
          background: 'var(--background)',
          cursor: total && selectedDriver ? 'pointer' : 'default',
          opacity: total && selectedDriver ? 1 : 0.45,
        }}
      >
        <CaretLeft size={14} />
      </button>
      <span
        aria-live="polite"
        style={{ minWidth: '2.5rem', textAlign: 'center' }}
      >
        {displayIndex}/{total}
      </span>
      <button
        type="button"
        aria-label="Next driver"
        disabled={total === 0 || !selectedDriver}
        onClick={() => go(safeIndex + 1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          borderRadius: 6,
          border: '1px solid var(--border)',
          background: 'var(--background)',
          cursor: total && selectedDriver ? 'pointer' : 'default',
          opacity: total && selectedDriver ? 1 : 0.45,
        }}
      >
        <CaretRight size={14} />
      </button>
    </div>
  );
}

// Drivers ordered for pager: long title + USA→World, EU negative + decimal %, Asia positive + large %, global negative.
const MOCK_DRIVERS: DriverData[] = [
  {
    id: 'mock-us-world-long-title',
    name: 'North American manufacturing PMI composite — orders, production, employment, supplier deliveries (SA, quarterly)',
    region: ['North America', 'United States of America'],
    category: 'Manufacturing',
    isPublic: true,
    importance: 84.2,
    direction: 0.55,
    lag: '1 quarter(s)',
    coordinates: getPreciseCoordinates('United States of America'),
    src_region: {
      name: 'United States of America',
      coordinates: { x: 0, y: 0 },
    },
    tgt_region: {
      name: 'World',
      coordinates: { x: 0, y: 0 },
    },
    rawImportance: { overall: { mean: 96 } },
    summary:
      'U.S. factory activity leads global manufacturing cycles by roughly one quarter: strength here typically coincides with wider world demand, with inventory and orders transmitting across trade links.',
    normalized_series: buildMonthlySeries(48, 42, 0.22),
  },
  {
    id: 'mock-europe-germany-negative',
    name: 'German industrial orders (domestic + foreign)',
    region: ['Europe', 'Germany'],
    category: 'Industrial',
    isPublic: true,
    importance: 81.6,
    direction: -0.42,
    lag: '2 month(s)',
    coordinates: getPreciseCoordinates('Germany'),
    summary:
      'New orders in Germany are a timely read on euro-area capex and export pipelines; pullbacks often precede broader EU production softness before PMI surveys fully reflect the turn.',
    normalized_series: buildMonthlySeries(62, 42, -0.12),
  },
  {
    id: 'mock-asia-japan-positive',
    name: 'Japan machinery orders (core private-sector ex. ships)',
    region: ['Asia', 'Japan'],
    category: 'market',
    isPublic: true,
    importance: 77,
    direction: 0.28,
    lag: '~1 month(s)',
    coordinates: getPreciseCoordinates('Japan'),
    rawImportance: { overall: { mean: 99 } },
    summary:
      'Core machinery orders capture forward-looking domestic investment and Asia supply-chain capex; spikes cluster around fiscal years and robotics/automation cycles.',
    normalized_series: buildMonthlySeries(55, 42, 0.18),
  },
  {
    id: 'mock-global-risk-negative',
    name: 'Global equity risk appetite (cross-asset composite)',
    region: ['World'],
    category: 'Trade',
    isPublic: true,
    importance: 66.5,
    direction: -0.05,
    lag: 'Unknown',
    coordinates: getPreciseCoordinates('World'),
    rawImportance: { overall: { mean: 91 } },
    summary:
      'Combines credit spreads, vol surfaces, and cyclical equity factor tilt into a single read on whether markets are paying for growth or for safety; sharp deterioration often coincides with funding stress.',
    normalized_series: buildMonthlySeries(40, 42, 0.08),
  },
];

export default function DriverMapPage() {
  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(
    MOCK_DRIVERS[0],
  );
  const [isLoading, setIsLoading] = useState(false);
  // DriverCard checks `inQueue` before `isLoading` — toggles queue empty state independent of mocks.
  const [inQueue, setInQueue] = useState(false);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Driver map' }]}
        title="DriverMap & DriverCard"
        subheader="World map with driver badges and the driver detail card — map clicks and the selector sync selection; arrow keys navigate the map."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="DriverMap renders a world map with badges for each driver, and DriverCard shows the detail of the selected driver. The two share a selection: clicking a badge on the map, using arrow keys, or paging through an external selector all update the same selected driver."
        whenToUse={[
          'To give a geographic overview of where drivers originate and let users explore them by region.',
          'Alongside DriverCard, so selecting a driver on the map reveals its importance, lag, and summary.',
          'When drivers carry coordinates or region metadata that benefits from a spatial presentation.',
        ]}
        whenNotToUse={[
          'When drivers have no meaningful geography; a table or list ranks them more clearly.',
          'For comparing driver series over time; use DriversComparisonChart instead.',
        ]}
        doNotes={[
          'Pass isLoading to both the map and the card so their loading states stay in sync.',
          'Provide a driverSelector in DriverCard so users can page through drivers without using the map.',
        ]}
      />
      <PageContentSection>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Switch
              id="loading-overlay"
              checked={isLoading}
              onCheckedChange={setIsLoading}
            />
            <label htmlFor="loading-overlay">Loading state</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Switch
              id="in-queue"
              checked={inQueue}
              onCheckedChange={setInQueue}
            />
            <label htmlFor="in-queue">In queue (empty state)</label>
          </div>
        </div>
        <PageColumns
          fill="left"
          columns={[
            <div
              key="map"
              style={{
                width: '100%',
                maxWidth: '100%',
                // @ts-expect-error CSS custom property on div
                '--shimmer-color': 'var(--page-color)',
              }}
            >
              <DriverMap
                drivers={MOCK_DRIVERS}
                isLoading={isLoading}
                selectedDriver={selectedDriver}
                setSelectedDriver={setSelectedDriver}
              />
            </div>,
            <DriverCard
              key="card"
              selectedDriver={selectedDriver}
              isLoading={isLoading}
              inQueue={inQueue}
              driverSelector={
                <DriverPager
                  drivers={MOCK_DRIVERS}
                  selectedDriver={selectedDriver}
                  onSelect={setSelectedDriver}
                />
              }
            />,
          ]}
        />
      </PageContentSection>
    </>
  );
}

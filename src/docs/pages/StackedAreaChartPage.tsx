import { useState } from 'react';

import { NumberControl } from '#uilib/components/ui/NumberControl';
import { PageContentSection, SectionHeader } from '#uilib/components/ui/Page';
import type {
  StackedAreaChartDatum,
  StackedAreaChartLayer,
  StackedAreaChartOverlay,
} from '#uilib/components/ui/StackedAreaChart';
import { StackedAreaChart } from '#uilib/components/ui/StackedAreaChart';
import StackedAreaChartGuidance from '#uilib/components/ui/StackedAreaChart/AGENT.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

/** Invented monthly cost layers per kg, three years from Jan 2023. */
const COST_ROWS: StackedAreaChartDatum[] = Array.from(
  { length: 36 },
  (_, i) => {
    const year = 2023 + Math.floor(i / 12);
    const month = String((i % 12) + 1).padStart(2, '0');
    const wave = Math.sin(i / 4);
    return {
      date: `${year}-${month}-01`,
      raw: Number((1.8 + 0.25 * wave + i * 0.01).toFixed(2)),
      energy: Number((0.6 + 0.15 * Math.cos(i / 3)).toFixed(2)),
      labour: Number((0.45 + i * 0.004).toFixed(2)),
      freight: Number((0.2 + 0.05 * wave).toFixed(2)),
      paid:
        i % 3 === 0 ? Number((3.3 + 0.35 * Math.sin(i / 5)).toFixed(2)) : null,
    };
  },
);

const COST_LAYERS: StackedAreaChartLayer[] = [
  { key: 'raw', label: 'Raw material' },
  { key: 'energy', label: 'Energy' },
  { key: 'labour', label: 'Labour' },
  { key: 'freight', label: 'Freight' },
];

const PAID: StackedAreaChartOverlay[] = [
  { key: 'paid', label: 'Prices paid', compare: true },
];

const QUARTER_ROWS: StackedAreaChartDatum[] = [
  {
    quarter: 'Q1',
    raw: 1.9,
    energy: 0.7,
    labour: 0.5,
    freight: 0.2,
    paid: 3.6,
  },
  {
    quarter: 'Q2',
    raw: 2.1,
    energy: 0.6,
    labour: 0.5,
    freight: 0.25,
    paid: 3.2,
  },
];

const formatPrice = (value: number) => `€${value.toFixed(2)}`;
const formatMonth = (value: string | number) =>
  new Date(String(value)).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });

export default function StackedAreaChartPage() {
  const [marginPct, setMarginPct] = useState(8);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'StackedAreaChart' }]}
        title="StackedAreaChart"
        subheader="Cost layers stacked over time, with a margin and lines over the stack."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={StackedAreaChartGuidance} />
      <PageContentSection>
        <SectionHeader
          title="Should cost"
          description="Four cost layers, a margin on top and the prices paid. Green where the price is above the cost, red where it is below. Click a legend entry to hide it."
          withMargin
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span>Margin %</span>
          <NumberControl
            value={marginPct}
            onChange={setMarginPct}
            min={0}
            max={50}
          />
        </div>
        <StackedAreaChart
          data={COST_ROWS}
          xKey="date"
          layers={COST_LAYERS}
          overlays={PAID}
          margin={{ pct: marginPct }}
          yearTicks
          valueFormatter={formatPrice}
          tooltipLabelFormatter={formatMonth}
          height={320}
        />
      </PageContentSection>
      <PageContentSection>
        <SectionHeader
          title="Few points"
          description="With fewer than three rows the stack draws as bars."
          withMargin
        />
        <StackedAreaChart
          data={QUARTER_ROWS}
          xKey="quarter"
          layers={COST_LAYERS}
          overlays={PAID}
          valueFormatter={formatPrice}
          height={260}
        />
      </PageContentSection>
    </>
  );
}

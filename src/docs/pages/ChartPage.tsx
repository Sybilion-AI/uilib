import { ChartContainer } from '#uilib/components/ui/Chart';
import type { ChartConfig } from '#uilib/components/ui/Chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const DATA = [
  { month: 'Jan', v: 12 },
  { month: 'Feb', v: 18 },
  { month: 'Mar', v: 15 },
  { month: 'Apr', v: 22 },
];

const config = {
  v: { label: 'Value', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

export default function ChartPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Chart' }]}
        title="Chart"
        subheader="ChartContainer + Recharts line chart."
        actions={<DocsHeaderActions />}
      />
      <ChartContainer config={config} style={{ minHeight: 240, width: '100%' }}>
        <LineChart data={DATA} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <Line
            dataKey="v"
            type="natural"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </>
  );
}

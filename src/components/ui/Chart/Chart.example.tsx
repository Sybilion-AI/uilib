import { PageContentSection } from '#uilib/components/ui/Page';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { ChartContainer } from './Chart';
import type { ChartConfig } from './Chart.types';

const DATA = [
  { month: 'Jan', v: 12 },
  { month: 'Feb', v: 18 },
  { month: 'Mar', v: 15 },
  { month: 'Apr', v: 22 },
];

const config = {
  v: { label: 'Value', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

export function ChartExample() {
  return (
    <PageContentSection>
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
    </PageContentSection>
  );
}

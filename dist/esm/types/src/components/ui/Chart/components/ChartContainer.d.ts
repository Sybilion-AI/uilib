import { ComponentProps } from 'react';
import { ChartConfig } from '#uilib/components/ui/Chart/Chart.types';
import * as RechartsPrimitive from 'recharts';
export declare function ChartContainer({ id, className, children, config, ...props }: ComponentProps<'div'> & {
    config: ChartConfig;
    children: ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}): import("react/jsx-runtime").JSX.Element;
export declare const ChartStyle: ({ id, config, }: {
    id: string;
    config: ChartConfig;
}) => import("react/jsx-runtime").JSX.Element;

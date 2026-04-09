import cn from 'classnames';
import { forwardRef } from 'react';

import { Line, LineChart } from 'recharts';

import { getStrokeColor, transformDataForChart } from './Sparkline.helpers';
import S from './Sparkline.styl';
import { SparklineProps } from './Sparkline.types';

const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(
  (
    {
      className,
      data,
      width = 100,
      height = 30,
      strokeWidth = 1,
      strokeColor = 'hsl(var(--foreground))',
      fillColor = 'hsl(var(--muted))',
      showValue = false,
      showEndDot = false,
      valueFormatter = value => value.toString(),
      ...props
    },
    ref,
  ) => {
    if (!data || data.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(S.sparklineNoData, className)}
          style={{ width, height }}
          {...props}
        >
          No data
        </div>
      );
    }

    const chartData = transformDataForChart(data);
    const finalStrokeColor = getStrokeColor(strokeColor);

    const dot = showEndDot
      ? (props: any) => {
          const { index, payload } = props;
          const isLastPoint = index === chartData.length - 1;
          if (!isLastPoint) return null;
          return (
            <circle cx={props.cx} cy={props.cy} r={3} fill={finalStrokeColor} />
          );
        }
      : false;

    return (
      <div ref={ref} className={cn(S.sparklineContainer, className)} {...props}>
        <LineChart width={width} height={height} data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={finalStrokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray="2 2"
            dot={dot}
            activeDot={false}
          />
        </LineChart>

        {showValue && (
          <span className={cn(S.sparklineValue)}>
            {valueFormatter(data[data.length - 1])}
          </span>
        )}
      </div>
    );
  },
);

Sparkline.displayName = 'Sparkline';

export { Sparkline };

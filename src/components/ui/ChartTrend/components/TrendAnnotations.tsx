import { Label, ReferenceDot } from 'recharts';

import type { TrendAnnotation } from '../ChartTrend.types';

interface TrendAnnotationsProps {
  annotations: TrendAnnotation[];
}

export function TrendAnnotations({ annotations }: TrendAnnotationsProps) {
  return (
    <>
      {annotations.map((annotation, index) => (
        <ReferenceDot
          key={`annotation-${index}`}
          x={annotation.x}
          y={annotation.y}
          r={0}
          fill="transparent"
          stroke="transparent"
        >
          <Label
            value={annotation.text}
            position="right"
            fill={annotation.color}
            fontSize={12}
            fontWeight="bold"
            offset={10}
          />
        </ReferenceDot>
      ))}
    </>
  );
}

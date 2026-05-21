import { useMemo } from 'react';

import { Tabs, TabsList, TabsTrigger } from '#uilib/components/ui/Tabs';
import { useThrottledCallback } from '#uilib/hooks/useThrottledCallback';

import S from './HorizonsSelector.styl';

interface HorizonsSelectorProps {
  selectedHorizon: string;
  onHorizonChange: (horizon: string) => void;
  availableHorizons: string[];
}

export function HorizonsSelector({
  selectedHorizon,
  onHorizonChange,
  availableHorizons,
}: HorizonsSelectorProps) {
  const horizons = useMemo(() => {
    return availableHorizons
      .sort((a, b) => {
        // Sort by horizon number: horizon_1, horizon_2, etc.
        const numA = parseInt(a.replace('horizon_', ''), 10);
        const numB = parseInt(b.replace('horizon_', ''), 10);
        return numA - numB;
      })
      .map(horizon => {
        const num = horizon.replace('horizon_', '');
        return {
          value: horizon,
          label: num,
        };
      });
  }, [availableHorizons]);

  const onChangeThrottled = useThrottledCallback(onHorizonChange, 300);

  if (horizons.length === 0) {
    return null;
  }

  return (
    <div className={S.root}>
      <span className={S.horizonsLabel}>Planning horizon in months:</span>
      <Tabs
        value={selectedHorizon}
        onValueChange={onHorizonChange}
        variant="button"
      >
        <TabsList>
          {horizons.map(horizon => (
            <TabsTrigger
              key={horizon.value}
              value={horizon.value}
              onPointerMove={() => {
                if (selectedHorizon !== horizon.value)
                  onChangeThrottled(horizon.value);
              }}
            >
              {horizon.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

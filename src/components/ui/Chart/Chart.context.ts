import { createContext, useContext } from 'react';

import { ChartContextProps } from './Chart.types';

export const ChartContext = createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = useContext(ChartContext);

  if (!context)
    throw new Error('useChart must be used within a <ChartContainer />');

  return context;
}

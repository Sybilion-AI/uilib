import { createContext, useContext } from 'react';

const ChartContext = createContext(null);
function useChart() {
    const context = useContext(ChartContext);
    if (!context)
        throw new Error('useChart must be used within a <ChartContainer />');
    return context;
}

export { ChartContext, useChart };

import { jsxs, jsx } from 'react/jsx-runtime';
import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../../../ui/Tabs/Tabs.js';
import { useThrottledCallback } from '../../../../hooks/useThrottledCallback.js';
import S from './HorizonsSelector.styl.js';

function HorizonsSelector({ selectedHorizon, onHorizonChange, availableHorizons, }) {
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
    return (jsxs("div", { className: S.root, children: [jsx("span", { className: S.horizonsLabel, children: "Planning horizon in months:" }), jsx(Tabs, { value: selectedHorizon, onValueChange: onHorizonChange, variant: "button", children: jsx(TabsList, { children: horizons.map(horizon => (jsx(TabsTrigger, { value: horizon.value, onPointerMove: () => {
                            if (selectedHorizon !== horizon.value)
                                onChangeThrottled(horizon.value);
                        }, children: horizon.label }, horizon.value))) }) })] }));
}

export { HorizonsSelector };

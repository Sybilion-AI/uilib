import { useEffect } from 'react';

function useShellWidthObserver(observedEl, onShellWidth) {
    useEffect(() => {
        if (!observedEl)
            return;
        const measure = () => {
            const w = observedEl.getBoundingClientRect().width;
            if (w > 0)
                onShellWidth(w);
        };
        const ro = new ResizeObserver(entries => {
            const w = entries[0]?.contentRect.width ?? 0;
            if (w > 0)
                onShellWidth(w);
        });
        ro.observe(observedEl);
        measure();
        return () => ro.disconnect();
    }, [observedEl, onShellWidth]);
}

export { useShellWidthObserver };

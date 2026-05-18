import { useState, useEffect } from 'react';
import { SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX } from './panelWidth.js';

/** True when viewport cannot fit mains min + sidebar min — use Sheet sidebar + single-column AppShell. */
function useIsSidebarSheetLayout() {
    const [narrow, setNarrow] = useState(typeof window !== 'undefined'
        ? window.innerWidth < SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX
        : undefined);
    useEffect(() => {
        const maxW = SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX - 1;
        const mql = window.matchMedia(`(max-width: ${maxW}px)`);
        const onChange = () => {
            setNarrow(window.innerWidth < SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX);
        };
        mql.addEventListener('change', onChange);
        setNarrow(window.innerWidth < SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX);
        return () => mql.removeEventListener('change', onChange);
    }, []);
    return !!narrow;
}

export { useIsSidebarSheetLayout };

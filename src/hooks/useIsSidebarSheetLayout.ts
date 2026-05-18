import { useEffect, useState } from 'react';

import { SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX } from '#uilib/hooks/panelWidth';

/** True when viewport cannot fit mains min + sidebar min — use Sheet sidebar + single-column AppShell. */
export function useIsSidebarSheetLayout(): boolean {
  const [narrow, setNarrow] = useState<boolean | undefined>(
    typeof window !== 'undefined'
      ? window.innerWidth < SIDEBAR_SHEET_SPLIT_MIN_VIEWPORT_PX
      : undefined,
  );

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

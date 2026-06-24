import { createContext, useContext, useMemo } from 'react';

import type {
  SidebarActionsContextProps,
  SidebarContextProps,
  SidebarStateContextProps,
} from './Sidebar.types';

const SidebarActionsContext = createContext<SidebarActionsContextProps | null>(
  null,
);
const SidebarStateContext = createContext<SidebarStateContextProps | null>(
  null,
);

export function useSidebarActions() {
  const context = useContext(SidebarActionsContext);
  if (!context) {
    throw new Error('useSidebarActions must be used within a SidebarProvider.');
  }

  return context;
}

export function useSidebarState() {
  const context = useContext(SidebarStateContext);
  if (!context) {
    throw new Error('useSidebarState must be used within a SidebarProvider.');
  }

  return context;
}

export function useSidebar(): SidebarContextProps {
  const actions = useSidebarActions();
  const state = useSidebarState();
  return useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions],
  );
}

export { SidebarActionsContext, SidebarStateContext };

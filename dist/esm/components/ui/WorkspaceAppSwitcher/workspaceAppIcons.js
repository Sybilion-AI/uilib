import { Boat, Package, TreeStructure } from '@phosphor-icons/react';
import { LayoutDashboard, ClockAlert } from 'lucide-react';

const WORKSPACE_APP_ICONS = {
    'grid-four': LayoutDashboard,
    clock: ClockAlert,
    boat: Boat,
    package: Package,
    'tree-structure': TreeStructure,
};
const ICON_KEYS = Object.keys(WORKSPACE_APP_ICONS);
function isWorkspaceAppIconKey(v) {
    return ICON_KEYS.includes(v);
}

export { WORKSPACE_APP_ICONS, isWorkspaceAppIconKey };

import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { AppHeaderPortal } from '../../ui/AppHeader/AppHeader.js';
import { PAGE_HEADER_ACTIONS_ID } from '../../ui/AppHeader/appChromeAnchors.js';
import { Gap } from '../../ui/Gap/Gap.js';
import { NavUserHeader } from '../../ui/NavUserHeader/NavUserHeader.js';
import { WorkspaceAppSwitcher } from '../../ui/WorkspaceAppSwitcher/WorkspaceAppSwitcher.js';
import '@phosphor-icons/react';
import 'lucide-react';
import S from './SybilionAppHeader.styl.js';

function SybilionAppHeader({ pageHeaderId, actionsAnchorId = PAGE_HEADER_ACTIONS_ID, actionsAnchorClassName, pathname, onNavigate, authenticated, defaultApps, appsStorageKey, ...navUserHeaderProps }) {
    return (jsxs(AppHeaderPortal, { pageHeaderId: pageHeaderId, children: [jsx(WorkspaceAppSwitcher, { pathname: pathname, onNavigate: onNavigate, authenticated: authenticated, defaultApps: defaultApps, appsStorageKey: appsStorageKey }), jsx(Gap, {}), jsx("div", { id: actionsAnchorId, className: cn(S.actionsAnchor, actionsAnchorClassName), children: jsx(NavUserHeader, { ...navUserHeaderProps }) })] }));
}

export { SybilionAppHeader };

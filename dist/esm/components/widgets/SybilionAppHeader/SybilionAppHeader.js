import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { AppHeaderPortal } from '../../ui/AppHeader/AppHeader.js';
import { PAGE_HEADER_ACTIONS_ID } from '../../ui/AppHeader/appChromeAnchors.js';
import { Gap } from '../../ui/Gap/Gap.js';
import { WorkspaceAppSwitcher } from '../../ui/WorkspaceAppSwitcher/WorkspaceAppSwitcher.js';
import '@phosphor-icons/react';
import 'lucide-react';
import S from './SybilionAppHeader.styl.js';

function SybilionAppHeader({ pageHeaderId, actions, actionsAnchorId = PAGE_HEADER_ACTIONS_ID, actionsAnchorClassName, ...workspaceSwitcherProps }) {
    return (jsxs(AppHeaderPortal, { pageHeaderId: pageHeaderId, children: [jsx(WorkspaceAppSwitcher, { ...workspaceSwitcherProps }), jsx(Gap, {}), jsx("div", { id: actionsAnchorId, className: cn(S.actionsAnchor, actionsAnchorClassName), children: actions })] }));
}

export { SybilionAppHeader };

import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { createPortal } from 'react-dom';
import S from './AppHeader.styl.js';
import { PAGE_HEADER_ID } from './appChromeAnchors.js';

function AppHeaderHost({ className, anchorId = PAGE_HEADER_ID, }) {
    return jsx("header", { className: cn(S.root, className), id: anchorId });
}
function AppHeaderPortal({ children }) {
    return createPortal(children, document.getElementById(PAGE_HEADER_ID));
}

export { AppHeaderHost, AppHeaderPortal };

import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import S from './AppHeader.styl.js';
import { PAGE_HEADER_ID } from './appChromeAnchors.js';

function AppHeaderHost({ className, anchorId = PAGE_HEADER_ID, }) {
    return jsx("header", { className: cn(S.root, className), id: anchorId });
}
function AppHeaderPortal({ children, pageHeaderId = PAGE_HEADER_ID, }) {
    const [container, setContainer] = useState(null);
    useLayoutEffect(() => {
        setContainer(document.getElementById(pageHeaderId));
    }, [pageHeaderId]);
    if (!container) {
        return null;
    }
    return createPortal(children, container);
}

export { AppHeaderHost, AppHeaderPortal };

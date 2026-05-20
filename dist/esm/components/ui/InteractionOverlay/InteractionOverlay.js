import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useCallback, useEffect } from 'react';
import { useIsTouchDevice } from '../../../hooks/useIsTouchDevice.js';
import S from './InteractionOverlay.styl.js';

function InteractionOverlay({ className, children, message = 'Touch to interact', }) {
    const isTouchDevice = useIsTouchDevice();
    const [isVisible, setIsVisible] = useState(true);
    const handleClick = useCallback(() => {
        setIsVisible(false);
    }, []);
    useEffect(() => {
        if (isTouchDevice) {
            setIsVisible(true);
        }
    }, [isTouchDevice]);
    useEffect(() => {
        if (!isTouchDevice)
            return;
        const handleScroll = () => {
            setIsVisible(true);
        };
        document.addEventListener('scroll', handleScroll, { capture: true });
        return () => {
            document.removeEventListener('scroll', handleScroll, { capture: true });
        };
    }, [isTouchDevice]);
    if (!isTouchDevice) {
        return jsx(Fragment, { children: children });
    }
    return (jsxs("div", { className: cn(S.root, !isVisible && S.hidden, className), children: [children, jsx("button", { type: "button", className: S.overlay, onClick: handleClick, "aria-label": message, children: jsx("span", { className: S.message, children: message }) })] }));
}

export { InteractionOverlay };

import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useRef } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip/Tooltip.js';

function TextWithDeferTooltip({ className, children, width, maxWidth, side = 'bottom', overTrigger = false, ...props }) {
    const [withTooltip, setWithTooltip] = useState(false);
    const ref = useRef(null);
    const handleMouseEnter = () => {
        if (!ref.current)
            return;
        const isOverflowingHorizontally = ref.current.scrollWidth - ref.current.clientWidth > 3;
        const isOverflowingVertically = ref.current.scrollHeight - ref.current.clientHeight > 3;
        if (isOverflowingHorizontally || isOverflowingVertically) {
            setWithTooltip(true);
        }
    };
    const textElement = (jsx("div", { ref: ref, className: className, onMouseEnter: handleMouseEnter, ...props, children: children }));
    if (withTooltip) {
        return (jsxs(Tooltip, { open: withTooltip, onOpenChange: setWithTooltip, children: [jsx(TooltipTrigger, { asChild: true, children: textElement }), jsx(TooltipContent, { side: side, overTrigger: overTrigger, maxWidth: maxWidth, style: width !== undefined ? { width: `${width}px` } : undefined, children: children })] }));
    }
    return textElement;
}

export { TextWithDeferTooltip };

import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useRef } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip/Tooltip.js';

function TextWithDeferTooltip({ className, children, width, maxWidth, side = 'bottom', overTrigger = false, ...props }) {
    const [withTooltip, setWithTooltip] = useState(false);
    const [tooltipStyles, setTooltipStyles] = useState({});
    const ref = useRef(null);
    const cachedFontSizeRef = useRef(null);
    const handleMouseEnter = () => {
        if (!ref.current)
            return;
        const isOverflowingHorizontally = ref.current.scrollWidth - ref.current.clientWidth > 3;
        const isOverflowingVertically = ref.current.scrollHeight - ref.current.clientHeight > 3;
        if (isOverflowingHorizontally || isOverflowingVertically) {
            const styles = {
                fontSize: cachedFontSizeRef.current || undefined,
            };
            if (ref.current) {
                const { width: rectWidth, left, top, } = ref.current.getBoundingClientRect();
                styles.width = `${width ?? rectWidth}px`;
                if (!cachedFontSizeRef.current) {
                    const { fontSize } = window.getComputedStyle(ref.current);
                    cachedFontSizeRef.current = fontSize;
                    styles.fontSize = fontSize;
                }
                if (overTrigger) {
                    styles.transform = `translate(${left}px, ${top}px) !important`;
                    // styles.translateX = `${left}px`;
                    // styles.translateY = `${top}px`;
                }
            }
            setTooltipStyles(styles);
            setWithTooltip(true);
        }
    };
    const textElement = (jsx("div", { ref: ref, className: className, onMouseEnter: handleMouseEnter, ...props, children: children }));
    if (withTooltip) {
        const tooltipSide = overTrigger ? 'bottom' : side;
        return (jsxs(Tooltip, { open: withTooltip, onOpenChange: setWithTooltip, children: [jsx(TooltipTrigger, { asChild: true, children: textElement }), jsx(TooltipContent, { side: tooltipSide, style: {
                        ...(maxWidth !== undefined && { maxWidth: `${maxWidth}px` }),
                        ...tooltipStyles,
                    }, children: children })] }));
    }
    return textElement;
}

export { TextWithDeferTooltip };

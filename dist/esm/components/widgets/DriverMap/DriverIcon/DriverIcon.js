import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { Badge } from '../../../ui/Badge/Badge.js';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../../ui/Tooltip/Tooltip.js';
import { getCategoryIcon } from '../driverCategoryIcon.js';
import S from './DriverIcon.styl.js';

const BADGE_SIZES = {
    s: 's',
    m: 'm',
    l: 'l',
};
function DriverIcon({ driver, size, isSelected, onClick, isVisible, isLoading = false, }) {
    return (jsxs(Tooltip, { children: [jsx(TooltipTrigger, { asChild: true, className: cn(S.root, S[`size-${size}`], isSelected && S.selected, isVisible ? S.visible : S.hidden, isLoading && S.loadingHidden), children: jsx("button", { type: "button", onClick: onClick, style: {
                        left: `${driver.coordinates.x}%`,
                        top: `${driver.coordinates.y}%`,
                        zIndex: isSelected ? 2 : '',
                    }, children: jsx(Badge, { className: S.badge, children: jsx("div", { className: S.icon, children: getCategoryIcon(driver.category) }) }) }) }), jsx(TooltipContent, { side: "top", className: S.tooltipContent, children: jsxs("div", { className: S.tooltipSpacing, children: [jsxs("div", { className: S.tooltipCategory, children: [jsx("span", { className: S.tooltipCategoryIcon, children: getCategoryIcon(driver.category) }), jsx("span", { className: S.tooltipCategoryText, children: driver.category })] }), jsx("div", { className: S.tooltipName, children: driver.name })] }) })] }));
}

export { BADGE_SIZES, DriverIcon };

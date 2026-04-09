import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState } from 'react';
import { Button } from '../Button/Button.js';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../DropdownMenu/DropdownMenu.js';
import { CaretDownIcon } from '@phosphor-icons/react';
import S from './RegionSelector.styl.js';

function RegionSelector({ children, onSelect, className, regions: regionCoordinates, }) {
    const [open, setOpen] = useState(false);
    const handleRegionSelect = (regionName) => {
        const coords = regionCoordinates[regionName];
        if (coords) {
            onSelect(regionName, coords);
            setOpen(false);
        }
    };
    const regions = Object.keys(regionCoordinates).sort();
    return (jsxs("div", { className: cn(S.root, className), children: [children, jsxs(DropdownMenu, { open: open, onOpenChange: setOpen, children: [jsx(DropdownMenuTrigger, { asChild: true, children: jsx(Button, { variant: "outline", size: "sm", className: S.button, children: jsx(CaretDownIcon, { size: 16 }) }) }), jsx(DropdownMenuContent, { align: "end", children: regions.map(region => (jsx(DropdownMenuItem, { onSelect: () => handleRegionSelect(region), children: region }, region))) })] })] }));
}

export { RegionSelector };

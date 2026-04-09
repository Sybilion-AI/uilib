'use client';

import cn from 'classnames';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { CaretDownIcon } from '@phosphor-icons/react';

import S from './RegionSelector.styl';
import type { RegionSelectorProps } from './RegionSelector.types';

export function RegionSelector({
  children,
  onSelect,
  className,
  regions: regionCoordinates,
}: RegionSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleRegionSelect = (regionName: string) => {
    const coords = regionCoordinates[regionName];
    if (coords) {
      onSelect(regionName, coords);
      setOpen(false);
    }
  };

  const regions = Object.keys(regionCoordinates).sort();

  return (
    <div className={cn(S.root, className)}>
      {children}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={S.button}>
            <CaretDownIcon size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {regions.map(region => (
            <DropdownMenuItem
              key={region}
              onSelect={() => handleRegionSelect(region)}
            >
              {region}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

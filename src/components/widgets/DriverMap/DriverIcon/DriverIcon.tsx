'use client';

import cn from 'classnames';

import { Badge } from '#uilib/components/ui/Badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';

import { getCategoryIcon } from '../driverCategoryIcon';
import type { DriverData } from '../driverMapGeography';
import S from './DriverIcon.styl';

export const BADGE_SIZES = {
  s: 's',
  m: 'm',
  l: 'l',
} as const;

export type BadgeSize = (typeof BADGE_SIZES)[keyof typeof BADGE_SIZES];

interface DriverIconProps {
  driver: DriverData;
  size: BadgeSize;
  isSelected: boolean;
  onClick: () => void;
  isVisible: boolean;
  isLoading?: boolean;
}

export function DriverIcon({
  driver,
  size,
  isSelected,
  onClick,
  isVisible,
  isLoading = false,
}: DriverIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        className={cn(
          S.root,
          S[`size-${size}`],
          isSelected && S.selected,
          isVisible ? S.visible : S.hidden,
          isLoading && S.loadingHidden,
        )}
      >
        <button
          type="button"
          onClick={onClick}
          style={{
            left: `${driver.coordinates.x}%`,
            top: `${driver.coordinates.y}%`,
            zIndex: isSelected ? 2 : '',
          }}
        >
          <Badge className={S.badge}>
            <div className={S.icon}>{getCategoryIcon(driver.category)}</div>
          </Badge>
        </button>
      </TooltipTrigger>

      <TooltipContent side="top" className={S.tooltipContent}>
        <div className={S.tooltipSpacing}>
          <div className={S.tooltipCategory}>
            <span className={S.tooltipCategoryIcon}>
              {getCategoryIcon(driver.category)}
            </span>
            <span className={S.tooltipCategoryText}>{driver.category}</span>
          </div>
          <div className={S.tooltipName}>{driver.name}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

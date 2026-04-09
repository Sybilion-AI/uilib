'use client';

import cn from 'classnames';
import { useCallback } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup';
import S from './MobileAdaptiveSelector.styl';
import type {
  MobileAdaptiveSelectorProps,
  SelectorItem,
} from './MobileAdaptiveSelector.types';

export function MobileAdaptiveSelector({
  value,
  onChange,
  items,
  placeholder = 'Select option',
  disabled = false,
  className,
  size = 'md',
  variant = 'default',
  darker = false,
  isDropdown = useIsMobile() || items.length > 4,
  ...props
}: MobileAdaptiveSelectorProps) {
  const handleToggleGroupChange = useCallback(
    (newValue: string) => {
      if (newValue) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  const handleSelectChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange],
  );

  const renderItem = (item: SelectorItem) => (
    <>
      {item.icon && (
        <img src={item.icon} alt={item.label} className={S.selectItemIcon} />
      )}
      {item.label}
    </>
  );

  const hasSingleItem = items.length === 1;

  return (
    <div className={cn(S.root, className)} {...props}>
      {isDropdown ? (
        <Select
          value={String(value)}
          onValueChange={handleSelectChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(S.selectTrigger, hasSingleItem && S.disabledSelect)}
            size={size}
            variant={variant}
            aria-label={placeholder}
            data-state={isDropdown ? 'open' : 'closed'}
            disabled={disabled}
            darker={darker}
            hideChevron={hasSingleItem}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={S.selectContent}>
            {items.map(item => (
              <SelectItem
                key={item.value}
                value={String(item.value)}
                selected={item.value === value}
                className={S.selectItem}
              >
                {renderItem(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <ToggleGroup
          type="single"
          size={size}
          value={String(value)}
          onValueChange={handleToggleGroupChange}
          variant="outline"
          className={S.toggleGroupDesktop}
          disabled={disabled}
        >
          {items.map(item => (
            <ToggleGroupItem
              key={item.value}
              value={String(item.value)}
              disabled={disabled}
              title={item.value.toString()}
            >
              {renderItem(item)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
}

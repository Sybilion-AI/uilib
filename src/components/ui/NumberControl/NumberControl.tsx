import cn from 'classnames';

import { MinusIcon, PlusIcon } from '@phosphor-icons/react';

import { Button } from '../Button';
import S from './NumberControl.styl';
import type { NumberControlProps } from './NumberControl.types';

export function NumberControl({
  className,
  value = 1,
  onChange,
  min,
  max,
  step = 0.1,
  ...props
}: NumberControlProps) {
  const round = (v: number) => (v ? Number(v.toFixed(2)) : 0);

  const handleMinus = () => {
    const newValue = round(value - step);
    if (min === undefined || newValue >= min) {
      onChange(newValue);
    }
  };

  const handlePlus = () => {
    const newValue = round(value + step);
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const isMinDisabled = min !== undefined && value <= min;
  const isMaxDisabled = max !== undefined && value >= max;

  return (
    <div className={cn(S.root, className)} {...props}>
      <Button
        icon
        variant="ghost"
        size="sm"
        onClick={handleMinus}
        disabled={isMinDisabled}
      >
        <MinusIcon size={16} />
      </Button>
      <span className={S.value}>{value}</span>
      <Button
        icon
        variant="ghost"
        size="sm"
        onClick={handlePlus}
        disabled={isMaxDisabled}
      >
        <PlusIcon size={16} />
      </Button>
    </div>
  );
}

import cn from 'classnames';

import { Input } from '#uilib/components/ui/Input';
import { Label } from '#uilib/components/ui/Label';
import { CheckIcon } from '@phosphor-icons/react';

import S from './LabeledInput.styl';

export const LabeledInput = ({
  label,
  id,
  type,
  name,
  value,
  onChange,
  placeholder = '',
  size = 'md',
  showCheckmark = false,
  disabled = false,
}: {
  label: string;
  id: string;
  type?: string;
  size?: 'sm' | 'md' | 'lg';
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showCheckmark?: boolean;
  disabled?: boolean;
}) => {
  return (
    <div className={cn(S.root, S[`size-${size}`])}>
      <Label htmlFor={id} className={S.label}>
        {label}
      </Label>
      <div className={S.inputWrapper}>
        <Input
          className={S.input}
          id={id}
          type={type}
          size={size}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
        {showCheckmark && <CheckIcon className={S.checkmark} weight="bold" />}
      </div>
    </div>
  );
};

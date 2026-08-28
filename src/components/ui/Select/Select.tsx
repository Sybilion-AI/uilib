import cn from 'classnames';

import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import S from './Select.styl';
import type {
  SelectContentProps,
  SelectGroupProps,
  SelectItemProps,
  SelectLabelProps,
  SelectProps,
  SelectScrollDownButtonProps,
  SelectScrollUpButtonProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueProps,
} from './Select.types';

function Select({
  variant = 'default',
  ...props
}: SelectProps & { variant?: 'default' | 'clear' }) {
  return (
    <SelectPrimitive.Root
      data-slot="select"
      data-variant={variant}
      {...props}
    />
  );
}

function SelectGroup({ ...props }: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = 'md',
  variant = 'default',
  darker = false,
  children,
  hideChevron = false,
  asChild = false,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-variant={variant}
      className={cn(
        !asChild && S.selectTrigger,
        !asChild && darker && S.darker,
        !asChild && variant === 'clear' && S.clear,
        className,
      )}
      asChild={asChild}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {!hideChevron && (
            <SelectPrimitive.Icon asChild>
              <ChevronDownIcon className={S.selectIcon} />
            </SelectPrimitive.Icon>
          )}
        </>
      )}
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          S.selectContent,
          position === 'popper' && S.selectContentPopper,
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            S.selectViewport,
            position === 'popper' && S.selectViewportPopper,
            className,
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  selected,
  ...props
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(S.selectItem, className, selected && S.selected)}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(S.selectSeparator, className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: SelectScrollUpButtonProps) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(S.selectScrollButton, className)}
      {...props}
    >
      <ChevronUpIcon className={S.selectScrollIcon} />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: SelectScrollDownButtonProps) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(S.selectScrollButton, className)}
      {...props}
    >
      <ChevronDownIcon className={S.selectScrollIcon} />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

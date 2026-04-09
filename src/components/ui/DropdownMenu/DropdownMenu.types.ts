import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

export interface DropdownMenuProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Root
> {}

export interface DropdownMenuPortalProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Portal
> {}

export interface DropdownMenuTriggerProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Trigger
> {}

export interface DropdownMenuContentProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Content
> {
  elevation?: 'sm' | 'md' | 'lg';
}

export interface DropdownMenuGroupProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Group
> {}

export interface DropdownMenuItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Item
> {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}

export interface DropdownMenuCheckboxItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
> {}

export interface DropdownMenuRadioGroupProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioGroup
> {}

export interface DropdownMenuRadioItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
> {}

export interface DropdownMenuLabelProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Label
> {
  inset?: boolean;
}

export interface DropdownMenuSeparatorProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Separator
> {}

export interface DropdownMenuShortcutProps extends React.ComponentProps<'span'> {}

export interface DropdownMenuSubProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Sub
> {}

export interface DropdownMenuSubTriggerProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.SubTrigger
> {
  inset?: boolean;
}

export interface DropdownMenuSubContentProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
> {}

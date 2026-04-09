import type { SelectContentProps, SelectGroupProps, SelectItemProps, SelectProps, SelectScrollDownButtonProps, SelectScrollUpButtonProps, SelectSeparatorProps, SelectTriggerProps, SelectValueProps } from './Select.types';
declare function Select({ variant, ...props }: SelectProps & {
    variant?: 'default' | 'clear';
}): import("react/jsx-runtime").JSX.Element;
declare function SelectGroup({ ...props }: SelectGroupProps): import("react/jsx-runtime").JSX.Element;
declare function SelectValue({ ...props }: SelectValueProps): import("react/jsx-runtime").JSX.Element;
declare function SelectTrigger({ className, size, variant, darker, children, hideChevron, ...props }: SelectTriggerProps): import("react/jsx-runtime").JSX.Element;
declare function SelectContent({ className, children, position, ...props }: SelectContentProps): import("react/jsx-runtime").JSX.Element;
declare function SelectItem({ className, children, selected, ...props }: SelectItemProps): import("react/jsx-runtime").JSX.Element;
declare function SelectSeparator({ className, ...props }: SelectSeparatorProps): import("react/jsx-runtime").JSX.Element;
declare function SelectScrollUpButton({ className, ...props }: SelectScrollUpButtonProps): import("react/jsx-runtime").JSX.Element;
declare function SelectScrollDownButton({ className, ...props }: SelectScrollDownButtonProps): import("react/jsx-runtime").JSX.Element;
export { Select, SelectContent, SelectGroup, SelectItem, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, };

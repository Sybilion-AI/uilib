import { ToggleGroupContextValue } from './ToggleGroup.types';

// Helper function to get context values with defaults
export const getContextValues = (
  context: ToggleGroupContextValue,
  itemVariant?: 'default' | 'outline',
  itemSize?: 'sm' | 'md' | 'lg',
): {
  variant: 'default' | 'outline';
  size: 'sm' | 'md' | 'lg';
} => ({
  variant: context.variant || itemVariant || 'default',
  size: context.size || itemSize || 'md',
});

// Helper function to get default context values
export const getDefaultContextValues = (): ToggleGroupContextValue => ({
  size: 'md',
  variant: 'default',
});

import { ComponentProps } from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

export type TabsVariant = 'button' | 'link' | 'outline';

export type TabsProps = ComponentProps<typeof TabsPrimitive.Root>;
export type TabsListProps = ComponentProps<typeof TabsPrimitive.List>;
export type TabsTriggerProps = ComponentProps<typeof TabsPrimitive.Trigger>;
export type TabsContentProps = ComponentProps<typeof TabsPrimitive.Content>;

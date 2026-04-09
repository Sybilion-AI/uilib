'use client';

import cn from 'classnames';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import S from './Tabs.styl';
import {
  TabsContentProps,
  TabsListProps,
  TabsProps,
  TabsTriggerProps,
} from './Tabs.types';

function Tabs({
  className,
  variant = 'button',
  darker = false,
  ...props
}: TabsProps & { variant?: 'button' | 'link'; darker?: boolean }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn(
        S.root,
        S[`variant-${variant}`],
        darker && S.darker,
        className,
      )}
      {...props}
    />
  );
}

function TabsList({
  className,
  fullWidth,
  darker,
  ...props
}: TabsListProps & { fullWidth?: boolean; darker?: boolean }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        S.list,
        fullWidth && S.fullWidth,
        darker && S.darker,
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(S.trigger, className)}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(S.content, className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

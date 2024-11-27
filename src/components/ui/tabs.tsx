import React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/utils/cn';

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ children, className, ...props }, ref) => {
  return (
    <TabsPrimitive.Root ref={ref} className={cn(className)} {...props}>
      {children}
    </TabsPrimitive.Root>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabList = TabsPrimitive.List;

const TabTrigger = TabsPrimitive.Trigger;

const TabContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ children, className, ...props }, ref) => {
  return (
    <TabsPrimitive.Content ref={ref} className={cn(className)} {...props}>
      {children}
    </TabsPrimitive.Content>
  );
});
TabContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabList, TabTrigger, TabContent };

import React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

import { cn } from '@/utils/cn';

import { Label } from './label';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ children, className, orientation, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn(className)}
      orientation={orientation}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ children, className, ...props }, ref) => {
  return (
    <div className="flex items-center">
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          'size-[15px] cursor-default rounded-full bg-white shadow-[0_1px_1px] shadow-black outline-none focus:shadow-[0_0_0_1px] focus:shadow-black',
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="relative flex size-full items-center justify-center after:block after:size-[8px] after:rounded-full after:bg-sky-500"></RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <Label className="ml-1">{children}</Label>
    </div>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

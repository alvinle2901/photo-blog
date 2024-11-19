import { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export default function Switcher({
  children,
  type = 'regular',
}: {
  children: ReactNode;
  type?: 'regular' | 'borderless';
}) {
  return (
    <div
      className={cn(
        'flex divide-x overflow-hidden',
        'divide-gray-300 dark:divide-gray-800',
        'border rounded-md',
        type === 'regular' ? 'border-gray-300 dark:border-gray-800' : 'border-transparent',
        type === 'regular' && 'shadow-sm',
      )}
    >
      {children}
    </div>
  );
}

import { ReactNode } from 'react';

import { Command } from 'cmdk';

import { cn } from '@/utils/cn';

import { Icons } from '../icons';

export default function CommandKItem({
  label,
  value,
  keywords,
  onSelect,
  accessory,
  annotation,
  annotationAria,
  loading,
  disabled,
}: {
  label: string;
  value: string;
  keywords?: string[];
  onSelect: () => void;
  accessory?: ReactNode;
  annotation?: ReactNode;
  annotationAria?: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Command.Item
      value={value}
      keywords={keywords}
      className={cn(
        'px-2',
        accessory ? 'py-2' : 'py-1',
        'rounded-md cursor-pointer tracking-wide',
        'active:!bg-gray-200/75',
        ...(loading
          ? ['data-[selected=true]:bg-gray-100/50']
          : ['data-[selected=true]:bg-gray-100']),
        disabled && 'opacity-15',
      )}
      onSelect={onSelect}
      disabled={loading || disabled}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {accessory}
        <span className="grow text-ellipsis truncate font-ibmMono font-medium">{label}</span>
        {annotation && !loading && (
          <span className="text-gray-400 whitespace-nowrap" aria-label={annotationAria}>
            <span aria-hidden={Boolean(annotationAria)}>{annotation}</span>
          </span>
        )}
        {loading && <Icons.loader size={12} className="animate-spin" />}
      </div>
    </Command.Item>
  );
}

'use client';

import { ReactNode, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { BiLockAlt, BiSolidUser } from 'react-icons/bi';
import { HiDocumentText } from 'react-icons/hi';

import { usePathname, useRouter } from 'next/navigation';

import { Command } from 'cmdk';
import { useDebounce } from 'use-debounce';

import { useLogout } from '@/hooks/use-logout';
import { useAppState } from '@/state';
import { cn } from '@/utils/cn';

import { Icons } from '../icons';
import { Dialog, DialogContent, DialogTitle } from '../ui/Dialog';
import CommandKItem from './CommandKItem';

const LISTENER_KEYDOWN = 'keydown';
const MINIMUM_QUERY_LENGTH = 2;

type CommandKItem = {
  label: string;
  keywords?: string[];
  accessory?: ReactNode;
  annotation?: ReactNode;
  annotationAria?: string;
  path?: string;
  action?: () => void | Promise<void>;
};

export type CommandKSection = {
  heading: string;
  accessory?: ReactNode;
  items: CommandKItem[];
};

export default function CommandKClient({
  serverSections = [],
  footer,
}: {
  serverSections?: CommandKSection[];
  footer?: string;
}) {
  const pathname = usePathname();
  const { isUserLoggedIn, isCommandKOpen: isOpen, setIsCommandKOpen: setIsOpen } = useAppState();

  const isOpenRef = useRef(isOpen);

  const [isPending, startTransition] = useTransition();
  const [keyPending, setKeyPending] = useState<string>();
  const shouldCloseAfterPending = useRef(false);

  useEffect(() => {
    if (!isPending) {
      setKeyPending(undefined);
      if (shouldCloseAfterPending.current) {
        setIsOpen?.(false);
        shouldCloseAfterPending.current = false;
      }
    }
  }, [isPending, setIsOpen]);

  // Raw query values
  const [queryLiveRaw, setQueryLive] = useState('');
  const [queryDebouncedRaw] = useDebounce(queryLiveRaw, 500, { trailing: true });
  const isPlaceholderVisible = queryLiveRaw === '';

  // Parameterized query values
  const queryLive = useMemo(() => queryLiveRaw.trim().toLocaleLowerCase(), [queryLiveRaw]);
  const queryDebounced = useMemo(
    () => queryDebouncedRaw.trim().toLocaleLowerCase(),
    [queryDebouncedRaw],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [queriedSections, setQueriedSections] = useState<CommandKSection[]>([]);

  const router = useRouter();

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen?.(!isOpen);
      }
    };
    document.addEventListener(LISTENER_KEYDOWN, down);
    return () => document.removeEventListener(LISTENER_KEYDOWN, down);
  }, [setIsOpen]);

  useEffect(() => {
    if (queryLive === '') {
      setQueriedSections([]);
      setIsLoading(false);
    } else if (queryLive.length >= MINIMUM_QUERY_LENGTH) {
      setIsLoading(true);
    }
  }, [queryLive]);

  useEffect(() => {
    if (isOpen) {
    } else if (!isOpen) {
      setQueryLive('');
      setQueriedSections([]);
      setIsLoading(false);
    }
  }, [isOpen]);

  const pagesItems: CommandKItem[] = [
    {
      label: 'Home',
      path: '/',
    },
    ...(pathname === '/grid'
      ? [{ label: '35mm', path: '/35mm' }]
      : pathname === '/35mm'
        ? [{ label: 'Grid', path: '/grid' }]
        : [
            { label: 'Grid', path: '/grid' },
            { label: '35mm', path: '/35mm' },
          ]),
  ];

  const sectionPages: CommandKSection = {
    heading: 'Pages',
    accessory: <HiDocumentText size={15} className="translate-x-[-1px]" />,
    items: pagesItems,
  };

  const adminSection: CommandKSection = {
    heading: 'Admin',
    accessory: <BiSolidUser size={15} className="translate-x-[-1px]" />,
    items: isUserLoggedIn
      ? (
          [
            {
              label: 'Dashboard',
              annotation: <BiLockAlt />,
              path: '/dashboard',
            },
            {
              label: 'Manage Photos',
              annotation: <BiLockAlt />,
              path: '/photos',
            },
          ] as CommandKItem[]
        ).concat({
          label: 'Sign Out',
          action: async () => {
            useLogout();
          },
        })
      : [
          {
            label: 'Sign In',
            path: '/auth/login',
          },
        ],
  };

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      label="Global Command Menu"
      filter={(value, search, keywords) => {
        const searchFormatted = search.trim().toLocaleLowerCase();
        return value.toLocaleLowerCase().includes(searchFormatted) ||
          keywords?.includes(searchFormatted)
          ? 1
          : 0;
      }}
      loop
    >
      <Dialog open={isOpen} onOpenChange={() => setIsOpen?.(false)}>
        <DialogTitle></DialogTitle>
        <DialogContent className="space-y-1.5 [&>button]:hidden top-[170px] w-[90%] md:top-[40%] rounded-xl">
          <div className="relative">
            <Command.Input
              onChangeCapture={(e) => setQueryLive(e.currentTarget.value)}
              className={cn(
                'w-full py-2 px-3',
                'focus:ring-0 outline-none',
                isPlaceholderVisible || (isLoading && '!pr-8'),
                '!border-gray-200 border rounded-lg',
                'focus:border-gray-200 border rounded-lg',
                'placeholder:text-gray-400',
                isPending && 'opacity-20',
              )}
              placeholder="Search photos, views, settings ..."
              disabled={isPending}
            />
            {isLoading && !isPending && (
              <span
                className={cn(
                  'absolute top-2.5 right-0 w-8',
                  'flex items-center justify-center translate-y-[2px]',
                )}
              >
                <Icons.loader size={10} className="animate-spin" />
              </span>
            )}
          </div>
          <Command.List className={cn('relative overflow-y-auto', 'max-h-48 sm:max-h-72')}>
            <Command.Empty className="mt-1 pl-3 text-dim">
              {isLoading ? 'Searching ...' : 'No results found'}
            </Command.Empty>
            {queriedSections
              .concat(sectionPages)
              .concat(adminSection)
              .filter(({ items }) => items.length > 0)
              .map(({ heading, accessory, items }) => (
                <Command.Group
                  key={heading}
                  heading={
                    <div className={cn('flex items-center', 'px-2', isPending && 'opacity-20')}>
                      {accessory && <div className="w-5">{accessory}</div>}
                      {heading}
                    </div>
                  }
                  className={cn(
                    'uppercase',
                    'select-none',
                    '[&>*:first-child]:py-1',
                    '[&>*:first-child]:font-medium',
                    '[&>*:first-child]:text-gray-400',
                    '[&>*:first-child]:text-xs',
                    '[&>*:first-child]:tracking-wider',
                  )}
                >
                  {items.map(
                    ({ label, keywords, accessory, annotation, annotationAria, path, action }) => {
                      const key = `${heading} ${label}`;
                      return (
                        <CommandKItem
                          key={key}
                          label={label}
                          value={key}
                          keywords={keywords}
                          onSelect={() => {
                            if (action) {
                              action();
                              if (!path) {
                                setIsOpen?.(false);
                              }
                            }
                            if (path) {
                              if (path !== pathname) {
                                setKeyPending(key);
                                startTransition(async () => {
                                  shouldCloseAfterPending.current = true;
                                  router.push(path, { scroll: true });
                                });
                              } else {
                                setIsOpen?.(false);
                              }
                            }
                          }}
                          accessory={accessory}
                          annotation={annotation}
                          annotationAria={annotationAria}
                          loading={key === keyPending}
                          disabled={isPending && key !== keyPending}
                        />
                      );
                    },
                  )}
                </Command.Group>
              ))}
            {footer && !queryLive && (
              <div className="text-center text-dim pt-3 sm:pt-4">{footer}</div>
            )}
          </Command.List>
        </DialogContent>
      </Dialog>
    </Command.Dialog>
  );
}

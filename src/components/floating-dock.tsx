'use client';

import { useState } from 'react';

import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { LucideIcon, Menu } from 'lucide-react';

import { cn } from '@/utils/cn';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/Tooltip';

export const FloatingDock = ({
  items,
  className,
}: {
  items: { title: string; icon: LucideIcon; href: string }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <TooltipProvider>
      <div className={cn('relative block md:hidden', className)}>
        <AnimatePresence>
          {open && (
            <motion.div
              layoutId="nav"
              className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
            >
              {items.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    transition: {
                      delay: idx * 0.05,
                    },
                  }}
                  transition={{ delay: (items.length - 1 - idx) * 0.05 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        key={item.title}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900"
                      >
                        <item.icon className="h-5 w-5 text-neutral-400" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800"
        >
          <Menu className="size-5 text-neutral-400" />
        </button>
      </div>
    </TooltipProvider>
  );
};

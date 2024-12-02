import Link from 'next/link';

import { cn } from '@/utils/cn';

export default function SwitcherItem({
  icon,
  title,
  href,
  className: classNameProp,
  onClick,
  active,
  noPadding,
}: {
  icon: JSX.Element;
  title?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  noPadding?: boolean;
}) {
  const className = cn(
    classNameProp,
    'py-0.5 px-1.5',
    'cursor-pointer',
    'hover:bg-gray-100/60 active:bg-gray-100',
    active ? 'text-black' : 'text-gray-400',
    active
      ? 'hover:text-black'
      : 'hover:text-gray-700',
  );

  const renderIcon = () =>
    noPadding ? (
      icon
    ) : (
      <div className="w-[28px] h-[24px] flex items-center justify-center">{icon}</div>
    );

  return href ? (
    <Link {...{ title, href, className }}>{renderIcon()}</Link>
  ) : (
    <div {...{ title, onClick, className }}>{renderIcon()}</div>
  );
}

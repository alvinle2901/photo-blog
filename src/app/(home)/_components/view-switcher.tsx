import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { useAppState } from '@/state';

import IconFeed from './iconFeed';
import IconGrid from './iconGrid';
import Switcher from './switcher';
import SwitcherItem from './switcher-item';

export type SwitcherSelection = 'feed' | 'grid';

export default function ViewSwitcher({
  currentSelection,
}: {
  currentSelection?: SwitcherSelection;
}) {
  const { setIsCommandKOpen } = useAppState();
  const [selection, setSelection] = useState<SwitcherSelection>();

  useEffect(() => {
    setSelection(currentSelection);
  }, [currentSelection]);

  return (
    <div className="flex gap-1 mt-2">
      <Switcher type="borderless">
        <SwitcherItem
          icon={<Icons.search size={18} />}
          onClick={() => {
            setIsCommandKOpen?.(true);
          }}
        />
      </Switcher>
      <Switcher>
        <SwitcherItem icon={<IconFeed />} href={'/'} active={selection === 'feed'} noPadding />
        <SwitcherItem icon={<IconGrid />} href={'/grid'} active={selection === 'grid'} noPadding />
      </Switcher>
    </div>
  );
}

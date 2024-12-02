import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import IconFeed from '@/components/icons/IconFeed';
import IconGrid from '@/components/icons/IconGrid';

import { useAppState } from '@/state';

import Switcher from './Switcher';
import SwitcherItem from './Switcher/SwitcherItem';

export type SwitcherSelection = 'feed' | 'grid';

const ViewSwitcher = ({ currentSelection }: { currentSelection?: SwitcherSelection }) => {
  const { setIsCommandKOpen } = useAppState();
  const [selection, setSelection] = useState<SwitcherSelection>();

  useEffect(() => {
    setSelection(currentSelection);
  }, [currentSelection]);

  return (
    <div className="flex gap-1 md:mt-2">
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
};

export default ViewSwitcher;

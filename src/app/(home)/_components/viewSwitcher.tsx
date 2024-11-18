import SwitcherItem from "./switcherItem";
import IconFeed from "./iconFeed";
import IconGrid from "./iconGrid";
import Switcher from "./switcher";
import { useEffect, useState } from "react";

export type SwitcherSelection = "feed" | "grid";

export default function ViewSwitcher({
  currentSelection,
}: {
  currentSelection?: SwitcherSelection;
}) {
  const [selection, setSelection] = useState<SwitcherSelection>();

  useEffect(() => {
    setSelection(currentSelection);
  }, [currentSelection]);

  return (
    <div className="flex gap-1 sm:gap-2">
      <Switcher>
        <SwitcherItem
          icon={<IconFeed />}
          href={"/"}
          active={selection === "feed"}
          noPadding
        />

        <SwitcherItem
          icon={<IconGrid />}
          href={"/grid"}
          active={selection === "grid"}
          noPadding
        />
      </Switcher>
    </div>
  );
}

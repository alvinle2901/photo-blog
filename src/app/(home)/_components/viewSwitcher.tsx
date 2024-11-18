import SwitcherItem from "./switcherItem";
import IconFeed from "./iconFeed";
import IconGrid from "./iconGrid";
import Switcher from "./switcher";

export type SwitcherSelection = "feed" | "grid";

export default function ViewSwitcher({
  currentSelection,
}: {
  currentSelection?: SwitcherSelection;
  showAdmin?: boolean;
}) {
  return (
    <div className="flex gap-1 sm:gap-2">
      <Switcher>
        <SwitcherItem
          icon={<IconFeed />}
          href={"/"}
          active={currentSelection === "feed"}
          noPadding
        />
        <SwitcherItem
          icon={<IconGrid />}
          href={"/grid"}
          active={currentSelection === "grid"}
          noPadding
        />
      </Switcher>
    </div>
  );
}

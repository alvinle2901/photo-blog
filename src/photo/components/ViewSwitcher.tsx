import { usePathname, useSearchParams } from "next/navigation";

import { Icons } from "@/components/icons";
import IconFeed from "@/components/icons/IconFeed";
import IconGrid from "@/components/icons/IconGrid";
import PhotoSortDropdown from "@/photo/components/PhotoSortDropdown";
import { parseSortOrder, parseSortType } from "@/photo/sort";
import { useAppState } from "@/providers/app-state";

import Switcher from "./Switcher";
import SwitcherItem from "./Switcher/SwitcherItem";

export type SwitcherSelection = "feed" | "grid";

const ViewSwitcher = ({
	currentSelection,
}: {
	currentSelection?: SwitcherSelection;
}) => {
	const { setIsCommandKOpen } = useAppState();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const sortType = parseSortType(searchParams.get("sortType"));
	const sortOrder = parseSortOrder(searchParams.get("sortOrder"));

	return (
		<div className="flex gap-1 md:mt-2">
			<Switcher type="borderless">
				<SwitcherItem
					className="px-0.5"
					icon={<Icons.search size={18} />}
					title="search"
					shortcut="⌘K"
					onClick={() => {
						setIsCommandKOpen?.(true);
					}}
				/>
			</Switcher>
			<Switcher>
				<SwitcherItem
					icon={<IconFeed />}
					href={"/"}
					title="feed"
					active={currentSelection === "feed"}
					noPadding
				/>
				<SwitcherItem
					icon={<IconGrid />}
					href={"/grid"}
					title="grid"
					active={currentSelection === "grid"}
					noPadding
				/>
			</Switcher>
			{pathname === "/" && (
				<PhotoSortDropdown
					basePath="/"
					sortType={sortType}
					sortOrder={sortOrder}
					triggerVariant="icon"
				/>
			)}
		</div>
	);
};

export default ViewSwitcher;

import { usePathname, useSearchParams } from "next/navigation";

import { Icons } from "@/components/icons";
import IconFeed from "@/components/icons/IconFeed";
import IconGrid from "@/components/icons/IconGrid";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import PhotoSortDropdown from "@/photo/components/PhotoSortDropdown";
import { isDefaultSort, parseSortOrder, parseSortType } from "@/photo/sort";
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
	const seed = searchParams.get("seed");

	const getViewHref = (basePath: "/" | "/grid") => {
		const params = new URLSearchParams();

		if (!isDefaultSort(sortType, sortOrder)) {
			params.set("sortType", sortType);
			params.set("sortOrder", sortOrder);
		}

		if (sortType === "random" && seed) {
			params.set("seed", seed);
		}

		const query = params.toString();

		return query ? `${basePath}?${query}` : basePath;
	};

	return (
		<div className="flex gap-1 md:mt-2">
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						aria-label="search"
						aria-keyshortcuts="Meta+K Control+K"
						className="inline-flex h-8 w-8 appearance-none cursor-pointer items-center justify-center rounded border-0 bg-transparent text-gray-400 transition-colors hover:bg-gray-100/60 hover:text-gray-700 active:bg-gray-100"
						onClick={() => {
							setIsCommandKOpen?.(true);
						}}
					>
						<Icons.search size={18} />
					</button>
				</TooltipTrigger>
				<TooltipContent>
					<span className="inline-flex items-center gap-1.5">
						<span>search</span>
						{["Cmd", "K"].map((key) => (
							<span
								key={key}
								className="rounded border border-[#e2d8cb] bg-[#fffdf9] px-1.5 py-0.5"
							>
								{key}
							</span>
						))}
					</span>
				</TooltipContent>
			</Tooltip>
			<Switcher>
				<SwitcherItem
					icon={<IconFeed />}
					href={getViewHref("/")}
					title="feed"
					active={currentSelection === "feed"}
					noPadding
				/>
				<SwitcherItem
					icon={<IconGrid />}
					href={getViewHref("/grid")}
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

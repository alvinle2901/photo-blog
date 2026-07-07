"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Flourish } from "@/components/icons/Flourish";
import { Flower } from "@/components/icons/Flower";
import PhotoSortDropdown from "@/photo/components/PhotoSortDropdown";
import { parseSortOrder, parseSortType } from "@/photo/sort";
import { isPathGrid } from "@/utils/string";

import LinksItem from "./LinksItem";
import SocialLinks from "./SocialLinks";
import ViewSwitcher, { type SwitcherSelection } from "./ViewSwitcher";

const Sidebar = () => {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const sortType = parseSortType(searchParams.get("sortType"));
	const sortOrder = parseSortOrder(searchParams.get("sortOrder"));

	const homeRoutes = [
		{
			label: "home.",
			href: "/",
		},
		{
			label: "map.",
			href: "/map",
		},
		{
			label: "35mm.",
			href: "/35mm",
		},
	];

	const switcherSelectionForPath = (): SwitcherSelection | undefined => {
		if (pathname === "/") {
			return "feed";
		} else if (isPathGrid(pathname)) {
			return "grid";
		}
	};

	return (
		<div className="h-screen w-[20%] shrink-0 py-8 px-8 sticky top-0 md:flex flex-col justify-between hidden">
			<div className="flex flex-col gap-6">
				<div>
					<Link href={"/"}>
						<p
							className="italic text-4xl text-[#18170f] font-light leading-none"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							momento
						</p>
						<p
							className="text-[#b5b0a8] mt-1 tracking-[0.14em]"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							by alv.
						</p>
					</Link>
					{/* Flourish */}
					<Flourish />
				</div>
				<ViewSwitcher currentSelection={switcherSelectionForPath()} />
				{pathname === "/" && (
					<div className="mt-1">
						<PhotoSortDropdown
							basePath="/"
							sortType={sortType}
							sortOrder={sortOrder}
							align="start"
						/>
					</div>
				)}
				{/* Navs */}
				<nav className="flex flex-1 flex-col gap-0.5 mt-2">
					{homeRoutes.map((route) => (
						<LinksItem
							label={route.label}
							href={route.href}
							key={route.href}
						></LinksItem>
					))}
				</nav>
			</div>
			<Flower />
			{/* Socials */}
			<SocialLinks />
		</div>
	);
};

export default Sidebar;

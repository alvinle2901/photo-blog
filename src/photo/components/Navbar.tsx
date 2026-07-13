"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/utils/cn";
import { isPathGrid } from "@/utils/string";

import ViewSwitcher, { type SwitcherSelection } from "./ViewSwitcher";

const Nav = () => {
	const pathname = usePathname();
	const isVisible = useScrollDirection();

	const switcherSelectionForPath = (): SwitcherSelection | undefined => {
		if (pathname === "/") {
			return "feed";
		} else if (isPathGrid(pathname)) {
			return "grid";
		}
	};

	return (
		<div
			className={cn(
				"sticky top-0 z-40 w-full bg-[#f7f5f2] px-5 py-3 transition-transform duration-300 ease-out will-change-transform md:hidden",
				!isVisible && "-translate-y-full",
				pathname.startsWith("/p/") && "hidden",
			)}
		>
			<div className="flex w-full items-center justify-between gap-4">
				<ViewSwitcher currentSelection={switcherSelectionForPath()} />
				<Link href="/" className="shrink-0 text-right">
					<span
						className="block text-xl font-light italic leading-none text-[#18170f]"
						style={{ fontFamily: "'Cormorant', serif" }}
					>
						momento
					</span>
					<span
						className="mt-1 block text-[10px] tracking-[0.14em] text-[#b5b0a8]"
						style={{ fontFamily: "'DM Mono', monospace" }}
					>
						by alv.
					</span>
				</Link>
			</div>
		</div>
	);
};

export default Nav;

"use client";

import { ArrowLeft } from "lucide-react";
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

	const detailBackHref = (() => {
		if (pathname.startsWith("/p/")) return "/";

		const segments = pathname.split("/").filter(Boolean);
		const isCollectionDetail =
			(segments[0] === "35mm" && segments.length === 2) ||
			((segments[0] === "year" || segments[0] === "film") &&
				segments.length === 3) ||
			(segments[0] === "shot-on" && segments.length === 4);

		return isCollectionDetail ? `/${segments.slice(0, -1).join("/")}` : null;
	})();

	return (
		<div
			className={cn(
				"sticky top-0 z-40 w-full bg-[#f7f5f2] px-5 py-3 transition-transform duration-300 ease-out will-change-transform md:hidden",
				!isVisible && !detailBackHref && "-translate-y-full",
			)}
		>
			<div className="flex w-full items-center justify-between gap-4">
				{detailBackHref ? (
					<div className="flex items-center gap-6">
						<Link
							href={detailBackHref}
							aria-label="Back to collection"
							className="inline-flex h-8 items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							<ArrowLeft aria-hidden="true" className="h-4 w-4" />
							<span>back</span>
						</Link>
						<ViewSwitcher showSort={false} />
					</div>
				) : (
					<ViewSwitcher currentSelection={switcherSelectionForPath()} />
				)}
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

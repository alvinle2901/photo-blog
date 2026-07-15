"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/utils/cn";

const LinksItem = ({ label, href }: { label: string; href: string }) => {
	const pathname = usePathname();

	const isActive =
		(pathname === "/" && href === "/") ||
		pathname === href ||
		pathname?.startsWith(`${href}/`);

	return (
		<Link
			href={href}
			prefetch
			className={cn(
				"w-full px-2 py-1.5 rounded text-[14px] tracking-[0.03em] transition-colors duration-150",
				isActive
					? "bg-[#ece7df] text-[#18170f]"
					: "text-[#b5b0a8] hover:text-[#18170f]",
			)}
			style={{ fontFamily: "'DM Mono', monospace" }}
		>
			{label}
		</Link>
	);
};

export default LinksItem;

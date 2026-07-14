import type { ReactNode } from "react";

type OverviewHeaderProps = {
	category: string;
	title: ReactNode;
	count: number;
	icon?: ReactNode;
};

export default function OverviewHeader({
	category,
	title,
	count,
	icon,
}: OverviewHeaderProps) {
	const noun = count === 1 ? "photo" : "photos";

	return (
		<header className="border-b border-[#ddd7ce] px-4 py-3 md:py-6 md:px-6 lg:px-8">
			<div className="min-w-0">
				<div
					className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase text-[#81786d]"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					{icon && <span className="text-[#3d3a35]">{icon}</span>}
					<span>{category}</span>
					<span>/</span>
					<span>
						{count} {noun}
					</span>
				</div>
				<h1
					className="max-w-3xl break-words text-2xl font-bold italic leading-tight text-[#18170f] md:text-4xl"
					style={{ fontFamily: "'EB Garamond', serif" }}
				>
					{title}
				</h1>
			</div>
		</header>
	);
}

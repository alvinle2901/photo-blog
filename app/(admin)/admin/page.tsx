import Link from "next/link";

const SECTIONS = [
	{
		href: "/admin/photos",
		label: "Photos",
		description: "View and manage all photos",
	},
	{ href: "/admin/uploads", label: "Upload", description: "Upload new photos" },
	{
		href: "/admin/albums",
		label: "Albums",
		description: "Organize photos into albums",
	},
	{ href: "/admin/tags", label: "Tags", description: "Manage photo tags" },
	{
		href: "/admin/storage",
		label: "Storage",
		description: "Review storage usage",
	},
	{
		href: "/admin/configuration",
		label: "Configuration",
		description: "Site settings",
	},
];

export default function AdminDashboard() {
	return (
		<div className="space-y-8 px-5 py-8 sm:px-8">
			<div>
				<p
					className="text-[11px] uppercase tracking-[0.18em] text-[#b5b0a8]"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					studio console
				</p>
				<h1
					className="mt-2 text-5xl font-light italic leading-none text-[#18170f]"
					style={{ fontFamily: "'Cormorant', serif" }}
				>
					admin
				</h1>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{SECTIONS.map((section) => (
					<Link
						key={section.href}
						href={section.href}
						className="block space-y-2 rounded-sm border border-[#e5e0d9] bg-[#ebe7df] p-4 transition-colors hover:border-[#18170f] hover:bg-[#f7f5f2]"
					>
						<div
							className="text-2xl font-light italic text-[#18170f]"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							{section.label}
						</div>
						<div className="text-sm leading-6 text-[#6f675d]">
							{section.description}
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

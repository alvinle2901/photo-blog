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
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{SECTIONS.map((section) => (
					<Link
						key={section.href}
						href={section.href}
						className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-1"
					>
						<div className="font-medium text-sm">{section.label}</div>
						<div className="text-xs text-gray-500">{section.description}</div>
					</Link>
				))}
			</div>
		</div>
	);
}

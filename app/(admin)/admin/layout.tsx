import Link from "next/link";

import { signOut } from "@/auth/actions";

const NAV_LINKS = [
	{ href: "/admin/photos", label: "Photos" },
	{ href: "/admin/uploads", label: "Upload" },
];

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-dvh bg-[#f7f5f2] text-[#18170f]">
			<header className="sticky top-0 z-40 border-b border-[#e5e0d9] bg-[#f7f5f2]/95 backdrop-blur">
				<nav className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
					<div className="flex min-w-0 items-center gap-6">
						<Link href="/admin" className="shrink-0">
							<span
								className="block text-2xl font-light italic leading-none"
								style={{ fontFamily: "'Cormorant', serif" }}
							>
								momento
							</span>
							<span
								className="mt-0.5 block text-[10px] uppercase tracking-[0.18em] text-[#b5b0a8]"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								admin
							</span>
						</Link>
						<div className="flex min-w-0 gap-1 overflow-x-auto">
							{NAV_LINKS.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="rounded-full border border-transparent px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-[#777065] transition-colors hover:border-[#d8d1c7] hover:bg-[#ebe7df] hover:text-[#18170f]"
									style={{ fontFamily: "'DM Mono', monospace" }}
								>
									{link.label}
								</Link>
							))}
						</div>
					</div>

					<form action={signOut}>
						<button
							type="submit"
							className="rounded-full border border-[#d8d1c7] bg-[#ebe7df] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-[#777065] transition-colors hover:bg-[#f7f5f2] hover:text-[#18170f]"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							Sign out
						</button>
					</form>
				</nav>
			</header>

			<main className="mx-auto w-full max-w-[1400px]">{children}</main>
		</div>
	);
}

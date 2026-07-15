import "./globals.css";

import type { Metadata } from "next";

import AppProviders from "@/providers/AppProviders";

export const metadata: Metadata = {
	title: {
		template: "%s - momento of alvin",
		default: "momento of alvin",
	},
};
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="h-full antialiased">
			<body>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}

import type { Metadata } from "next";

import "./globals.css";

import { Suspense } from "react";
import AppStateProvider from "@/state/AppStateProvider";

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
				<Suspense>
					<AppStateProvider>{children}</AppStateProvider>
				</Suspense>
			</body>
		</html>
	);
}

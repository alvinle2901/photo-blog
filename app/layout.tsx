import "./globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";

import SharedHoverProvider from "@/components/shared-hover/SharedHoverProvider";
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
					<AppStateProvider>
						<SharedHoverProvider>{children}</SharedHoverProvider>
					</AppStateProvider>
				</Suspense>
			</body>
		</html>
	);
}

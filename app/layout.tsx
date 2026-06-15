import type { Metadata } from "next";
import { IBM_Plex_Mono, Poppins, Readex_Pro } from "next/font/google";

import "./globals.css";

const readex = Readex_Pro({ subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700"],
	style: ["normal", "italic"],
	variable: "--font-ibm-plex-mono",
});
const poppins = Poppins({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	style: ["normal", "italic"],
	variable: "--font-poppins",
});

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
			<body
				className={`${readex.className} ${ibmPlexMono.variable} ${poppins.variable}`}
			>
				<Suspense>
					<AppStateProvider>{children}</AppStateProvider>
				</Suspense>
			</body>
		</html>
	);
}

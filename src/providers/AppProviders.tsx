"use client";

import { type ReactNode, Suspense } from "react";

import AppStateProvider from "@/providers/app-state/AppStateProvider";
import SharedHoverProvider from "@/providers/shared-hover/SharedHoverProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
	return (
		<Suspense>
			<AppStateProvider>
				<SharedHoverProvider>{children}</SharedHoverProvider>
			</AppStateProvider>
		</Suspense>
	);
}

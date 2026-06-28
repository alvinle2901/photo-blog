"use client";

import { type ReactNode, useEffect, useState } from "react";
import type { AnimationConfig } from "@/components/AnimateItems";
import { AppStateContext } from ".";

export default function StateProvider({ children }: { children: ReactNode }) {
	const [hasLoaded, setHasLoaded] = useState(false);
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
	const [isCommandKOpen, setIsCommandKOpen] = useState(false);
	const [nextPhotoAnimation, setNextPhotoAnimation] =
		useState<AnimationConfig>();

	useEffect(() => {
		setHasLoaded?.(true);
	}, [setHasLoaded]);

	useEffect(() => {
		let isMounted = true;

		const syncAuthStatus = async () => {
			try {
				const response = await fetch("/api/auth/status", {
					method: "GET",
					cache: "no-store",
					credentials: "same-origin",
				});

				if (!response.ok) {
					if (isMounted) {
						setIsUserLoggedIn(false);
					}
					return;
				}

				const data = (await response.json()) as {
					isUserLoggedIn?: boolean;
				};

				if (isMounted) {
					setIsUserLoggedIn(data.isUserLoggedIn === true);
				}
			} catch {
				if (isMounted) {
					setIsUserLoggedIn(false);
				}
			}
		};

		syncAuthStatus();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<AppStateContext.Provider
			value={{
				hasLoaded,
				setHasLoaded,
				isUserLoggedIn,
				setIsUserLoggedIn,
				isCommandKOpen,
				setIsCommandKOpen,
				nextPhotoAnimation,
				setNextPhotoAnimation,
				clearNextPhotoAnimation: () => setNextPhotoAnimation?.(undefined),
			}}
		>
			{children}
		</AppStateContext.Provider>
	);
}

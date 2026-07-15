"use client";

import { type ReactNode, useEffect, useState } from "react";

import type { AnimationConfig } from "@/components/AnimateItems";
import { useHoverSupport } from "@/hooks/use-hover-support";

import { AppStateContext, type PhotoShareData } from ".";

export default function AppStateProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [hasLoaded, setHasLoaded] = useState(false);
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
	const [isCommandKOpen, setIsCommandKOpen] = useState(false);
	const [nextPhotoAnimation, setNextPhotoAnimation] =
		useState<AnimationConfig>();
	const [photoShareData, setPhotoShareData] = useState<PhotoShareData>();
	const supportsHover = useHoverSupport();

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			setHasLoaded(true);
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	}, []);

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
				photoShareData,
				setPhotoShareData,
				supportsHover,
			}}
		>
			{children}
		</AppStateContext.Provider>
	);
}

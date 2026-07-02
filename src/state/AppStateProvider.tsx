"use client";

import {
	type ReactNode,
	useEffect,
	useState,
	useSyncExternalStore,
} from "react";

import type { AnimationConfig } from "@/components/AnimateItems";

import { AppStateContext, type PhotoShareData } from ".";

const hoverMediaQuery = "(hover: hover) and (pointer: fine)";

function subscribeToHoverSupport(callback: () => void) {
	if (typeof window === "undefined") return () => {};

	const mediaQuery = window.matchMedia(hoverMediaQuery);
	mediaQuery.addEventListener("change", callback);

	return () => {
		mediaQuery.removeEventListener("change", callback);
	};
}

function getHoverSupportSnapshot() {
	return (
		typeof window !== "undefined" && window.matchMedia(hoverMediaQuery).matches
	);
}

export default function StateProvider({ children }: { children: ReactNode }) {
	const [hasLoaded, setHasLoaded] = useState(false);
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
	const [isCommandKOpen, setIsCommandKOpen] = useState(false);
	const [nextPhotoAnimation, setNextPhotoAnimation] =
		useState<AnimationConfig>();
	const [photoShareData, setPhotoShareData] = useState<PhotoShareData>();
	const supportsHover = useSyncExternalStore(
		subscribeToHoverSupport,
		getHoverSupportSnapshot,
		() => false,
	);

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

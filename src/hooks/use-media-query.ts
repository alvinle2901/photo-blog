"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string, defaultMatches = false) {
	const subscribe = useCallback(
		(callback: () => void) => {
			if (typeof window === "undefined") return () => {};

			const mediaQuery = window.matchMedia(query);
			mediaQuery.addEventListener("change", callback);

			return () => {
				mediaQuery.removeEventListener("change", callback);
			};
		},
		[query],
	);

	const getSnapshot = useCallback(
		() => typeof window !== "undefined" && window.matchMedia(query).matches,
		[query],
	);

	const getServerSnapshot = useCallback(() => defaultMatches, [defaultMatches]);

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

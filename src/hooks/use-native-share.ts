"use client";

import { useSyncExternalStore } from "react";

export function useNativeShare() {
	return useSyncExternalStore(
		() => () => undefined,
		() => typeof navigator !== "undefined" && !!navigator.share,
		() => false,
	);
}

"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

const HOVER_SUPPORT_QUERY = "(hover: hover) and (pointer: fine)";

export function useHoverSupport() {
	return useMediaQuery(HOVER_SUPPORT_QUERY);
}

"use client";

import { createContext, useContext } from "react";

export type LightboxImage = {
	src: string;
	alt: string;
	aspectRatio: number;
	blurData?: string | null;
};

type LightboxContextValue = {
	openLightbox: (image: LightboxImage, zoom?: number) => void;
};

export const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox() {
	const context = useContext(LightboxContext);
	if (!context) {
		throw new Error("Lightbox components must be used inside LightboxProvider");
	}
	return context;
}

"use client";

import { createContext, useContext } from "react";

import type { AnimationConfig } from "@/components/AnimateItems";
import type { Photo } from "@/photo";

export type PhotoShareData = {
	photo: Photo;
};

export interface AppStateContext {
	previousPathname?: string;
	hasLoaded?: boolean;
	setHasLoaded?: (hasLoaded: boolean) => void;
	isUserLoggedIn?: boolean;
	setIsUserLoggedIn?: (isUserLoggedIn: boolean) => void;
	isCommandKOpen?: boolean;
	setIsCommandKOpen?: (isCommandKOpen: boolean) => void;
	nextPhotoAnimation?: AnimationConfig;
	setNextPhotoAnimation?: (animation?: AnimationConfig) => void;
	clearNextPhotoAnimation?: () => void;
	photoShareData?: PhotoShareData;
	setPhotoShareData?: (data?: PhotoShareData) => void;
	supportsHover?: boolean;
}

export const AppStateContext = createContext<AppStateContext>({});

export const useAppState = () => useContext(AppStateContext);

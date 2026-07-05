"use client";

import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext } from "react";

export type SharedHoverProps = {
	key: string;
	width: number;
	height: number;
	offsetAbove: number;
	offsetBelow: number;
};

export type SharedHoverState = {
	showHover?: (
		trigger: HTMLElement | null,
		hover: SharedHoverProps,
		style?: CSSProperties,
	) => void;
	renderHover?: Dispatch<SetStateAction<ReactNode>>;
	dismissHover?: (trigger: HTMLElement | null) => void;
	isHoverBeingShown?: (key: string) => boolean;
};

export const SharedHoverContext = createContext<SharedHoverState>({});

export const useSharedHoverState = () => useContext(SharedHoverContext);

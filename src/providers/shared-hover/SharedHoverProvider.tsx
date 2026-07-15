"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

import { cn } from "@/utils/cn";

import { SharedHoverContext, type SharedHoverProps } from ".";

const WINDOW_CHANGE_EVENTS = ["mouseup", "mousewheel", "resize", "scroll"];

const DELAY_INITIAL_HOVER = 180;
const DELAY_DISMISS = 180;
const VIEWPORT_SAFE_AREA = 12;
const HOVER_MARGIN = 12;

export default function SharedHoverProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [hoverProps, setHoverProps] = useState<SharedHoverProps>();
	const [hoverContent, setHoverContent] = useState<ReactNode>();
	const [hoverStyle, setHoverStyle] = useState<CSSProperties>();

	const currentTriggerRef = useRef<HTMLElement | null>(null);
	const timeoutInitialHoverRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const timeoutDismissRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const clearTimeouts = useCallback(() => {
		clearTimeout(timeoutInitialHoverRef.current);
		timeoutInitialHoverRef.current = undefined;
		clearTimeout(timeoutDismissRef.current);
		timeoutDismissRef.current = undefined;
	}, []);

	const clearState = useCallback(
		(delay = 0) => {
			clearTimeouts();
			if (delay) {
				timeoutDismissRef.current = setTimeout(() => {
					setHoverProps(undefined);
					currentTriggerRef.current = null;
				}, delay);
			} else {
				setHoverProps(undefined);
				currentTriggerRef.current = null;
			}
		},
		[clearTimeouts],
	);

	const showHover = useCallback(
		(
			triggerElement: HTMLElement | null,
			hover: SharedHoverProps,
			style?: CSSProperties,
		) => {
			if (!triggerElement) return;

			currentTriggerRef.current = triggerElement;

			const displayHover = () => {
				currentTriggerRef.current = triggerElement;
				setHoverProps(hover);

				const trigger = triggerElement.getBoundingClientRect();
				const top =
					trigger.top - (hover.height + HOVER_MARGIN) < VIEWPORT_SAFE_AREA
						? trigger.bottom + HOVER_MARGIN + hover.offsetBelow
						: trigger.top - (hover.height + HOVER_MARGIN) + hover.offsetAbove;
				const horizontalOffset =
					window.innerWidth - (trigger.left + hover.width) < VIEWPORT_SAFE_AREA
						? { right: VIEWPORT_SAFE_AREA }
						: { left: trigger.left };

				setHoverStyle({ top, ...horizontalOffset, ...style });
				clearTimeouts();
			};

			if (hoverProps) {
				displayHover();
			} else {
				timeoutInitialHoverRef.current = setTimeout(
					displayHover,
					DELAY_INITIAL_HOVER,
				);
			}
		},
		[clearTimeouts, hoverProps],
	);

	const dismissHover = useCallback(
		(trigger: HTMLElement | null) => {
			if (trigger === currentTriggerRef.current) {
				clearState(DELAY_DISMISS);
			}
		},
		[clearState],
	);

	const isHoverBeingShown = useCallback(
		(key: string) => Boolean(hoverProps?.key && hoverProps.key === key),
		[hoverProps],
	);

	useEffect(() => {
		const onWindowChange = () => clearState(0);

		WINDOW_CHANGE_EVENTS.forEach((event) => {
			window.addEventListener(event, onWindowChange, { passive: true });
		});

		return () => {
			WINDOW_CHANGE_EVENTS.forEach((event) => {
				window.removeEventListener(event, onWindowChange);
			});
		};
	}, [clearState]);

	return (
		<SharedHoverContext.Provider
			value={{
				showHover,
				dismissHover,
				renderHover: setHoverContent,
				isHoverBeingShown,
			}}
		>
			<div className="pointer-events-none fixed inset-0 z-[100]">
				<AnimatePresence>
					{hoverProps && (
						<motion.div
							initial={{ opacity: 0, y: 8, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 8, scale: 0.98 }}
							transition={{ duration: 0.18, ease: "easeOut" }}
							layoutId="shared-hover"
							className={cn(
								"fixed rounded border border-[#d8d0c5] bg-[#fbfaf7] p-1 shadow-lg",
								"shadow-black/10",
							)}
							style={hoverStyle}
						>
							<div
								className="relative overflow-hidden rounded-sm bg-[#ebe7df]"
								style={{
									width: hoverProps.width,
									height: hoverProps.height,
								}}
							>
								{hoverContent}
								<div className="absolute inset-0 rounded-sm border border-black/10" />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			{children}
		</SharedHoverContext.Provider>
	);
}

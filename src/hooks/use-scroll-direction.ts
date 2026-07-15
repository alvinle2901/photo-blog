"use client";

import { useEffect, useRef, useState } from "react";

const TOP_THRESHOLD = 24;
const DIRECTION_THRESHOLD = 8;

export function useScrollDirection() {
	const [isVisible, setIsVisible] = useState(true);
	const lastScrollY = useRef(0);

	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const distance = scrollY - lastScrollY.current;

			if (scrollY <= TOP_THRESHOLD) {
				setIsVisible(true);
			} else if (Math.abs(distance) >= DIRECTION_THRESHOLD) {
				setIsVisible(distance < 0);
			}

			lastScrollY.current = scrollY;
		};

		lastScrollY.current = window.scrollY;
		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return isVisible;
}

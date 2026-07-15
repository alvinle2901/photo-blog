"use client";

import { useEffect } from "react";

export function useBodyLightboxState(open: boolean) {
	useEffect(() => {
		document.body.dataset.photoLightboxOpen = open ? "true" : "false";

		return () => {
			delete document.body.dataset.photoLightboxOpen;
		};
	}, [open]);
}

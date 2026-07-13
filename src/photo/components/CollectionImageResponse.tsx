import type { ReactNode } from "react";

import type { Photo } from "@/photo";

type CollectionImageResponseProps = {
	title: ReactNode;
	photos: Photo[];
};

/** Shared Open Graph content for the year, camera, and film collections. */
export default function CollectionImageResponse({
	title,
	photos,
}: CollectionImageResponseProps) {
	const label = photos.length === 1 ? "photo" : "photos";

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				background: "#f7f5f2",
				color: "#111827",
				padding: 48,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 16,
					fontSize: 48,
					fontWeight: 700,
				}}
			>
				{title}
			</div>
			<div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>
				{photos.length} {label}
			</div>
		</div>
	);
}

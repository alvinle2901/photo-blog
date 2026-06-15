// image render for react-photo-album lib

import Image from "next/image";
import type { RenderImageContext, RenderImageProps } from "react-photo-album";

export default function renderNextImage(
	{ alt = "", title, sizes }: RenderImageProps,
	{ photo, width, height }: RenderImageContext,
) {
	return (
		<div
			style={{
				width: "100%",
				position: "relative",
				aspectRatio: `${width} / ${height}`,
			}}
		>
			<Image
				fill
				src={photo}
				alt={alt}
				title={title}
				sizes={sizes}
				placeholder={"blurDataURL" in photo ? "blur" : undefined}
			/>
		</div>
	);
}

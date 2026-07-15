import sharp from "sharp";

export type OptimizedSuffix = "sm" | "md" | "lg";

export const OPTIMIZED_SIZES: {
	suffix: OptimizedSuffix;
	/** max width in pixels */
	width: number;
	quality: number;
}[] = [
	{ suffix: "sm", width: 200, quality: 90 },
	{ suffix: "md", width: 640, quality: 90 },
	{ suffix: "lg", width: 1080, quality: 80 },
];

export type OptimizedVariant = {
	suffix: OptimizedSuffix;
	buffer: Buffer;
};

/**
 * Resize the original image buffer into sm / md / lg variants.
 * Each variant is a JPEG buffer ready to be uploaded to storage.
 */
export async function generateOptimizedVariants(
	original: Buffer,
): Promise<OptimizedVariant[]> {
	return Promise.all(
		OPTIMIZED_SIZES.map(async ({ suffix, width, quality }) => {
			const buffer = await sharp(original)
				// Respect EXIF orientation before resizing/encoding.
				.rotate()
				.resize(width, undefined, { withoutEnlargement: true })
				.toFormat("jpeg", { quality })
				.toBuffer();
			return { suffix, buffer };
		}),
	);
}

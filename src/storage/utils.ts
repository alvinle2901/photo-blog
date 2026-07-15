import type { OptimizedSuffix } from "../upload/generate-optimized";

/**
 * Derive the storage key for an optimized variant from the original key.
 * e.g. "photos/abc.jpg" + "lg" → "photos/abc-lg.jpg"
 */
export function getOptimizedKey(
	originalKey: string,
	suffix: OptimizedSuffix,
): string {
	const dot = originalKey.lastIndexOf(".");
	const base = dot !== -1 ? originalKey.slice(0, dot) : originalKey;
	return `${base}-${suffix}.jpg`;
}

/**
 * Derive the public URL for an optimized variant from the original URL.
 * e.g. "https://cdn.example.com/photos/abc.jpg" + "lg" → ".../photos/abc-lg.jpg"
 */
export function getOptimizedUrl(
	originalUrl: string,
	suffix: OptimizedSuffix,
): string {
	const dot = originalUrl.lastIndexOf(".");
	const base = dot !== -1 ? originalUrl.slice(0, dot) : originalUrl;
	return `${base}-${suffix}.jpg`;
}

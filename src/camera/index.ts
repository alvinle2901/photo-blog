import type { Photo } from "@/photo";

export const CAMERA_GRID_INITIAL = 48;

export function cameraLabel(make: string, model: string): string {
	return `${make} ${model}`.trim();
}

export function absolutePathForCamera(make: string, model: string): string {
	return `/shot-on/${encodeURIComponent(make)}/${encodeURIComponent(model)}`;
}

export function absolutePathForPhoto(
	make: string,
	model: string,
	photoId: string,
): string {
	return `/shot-on/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${photoId}`;
}

export function absolutePathForCameraImage(
	make: string,
	model: string,
): string {
	return `/shot-on/${encodeURIComponent(make)}/${encodeURIComponent(model)}/image`;
}

export function titleForCamera(
	make: string,
	model: string,
	count: number,
): string {
	const label = cameraLabel(make, model);
	return `${label} (${count} ${count === 1 ? "photo" : "photos"})`;
}

export function descriptionForCamera(
	make: string,
	model: string,
	count: number,
): string {
	const label = cameraLabel(make, model);
	return `${count} ${count === 1 ? "photo" : "photos"} shot on ${label}.`;
}

export function titleForPhoto(photo: Photo): string {
	return photo.title || photo.caption || `Photo ${photo.id}`;
}

export function descriptionForPhoto(photo: Photo, html = false): string {
	const parts = [photo.caption, photo.semanticDescription].filter(
		Boolean,
	) as string[];
	const raw = parts.join(" ").trim() || `Photo ${photo.id}`;
	return html ? raw : raw.replace(/<[^>]+>/g, "");
}

export function generateMetaForCamera(
	make: string,
	model: string,
	photos: Photo[],
	explicitCount?: number,
) {
	const count = explicitCount ?? photos.length;
	const title = titleForCamera(make, model, count);
	const description = descriptionForCamera(make, model, count);

	return {
		url: absolutePathForCamera(make, model),
		title,
		description,
		images: photos[0]?.url ? [photos[0].url] : undefined,
	};
}

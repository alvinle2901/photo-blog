import type { FilmPhoto } from "@/35mm/query";

export function absolutePathFor35mm(): string {
	return "/35mm";
}

export function absolutePathFor35mmPhoto(photoId: string): string {
	return `/35mm/${photoId}`;
}

export function titleFor35mmPhoto(photo: FilmPhoto): string {
	return photo.title || `35mm Photo ${photo.id}`;
}

export function descriptionFor35mmPhoto(
	photo: FilmPhoto,
	html = false,
): string {
	const raw =
		[photo.description, photo.film].filter(Boolean).join(" - ").trim() ||
		`35mm Photo ${photo.id}`;

	return html ? raw : raw.replace(/<[^>]+>/g, "");
}

import { desc, eq, isNotNull } from "drizzle-orm";
import { db } from "../db/client";
import { photos } from "../db/schema";
import { type Photo, rowToPhoto } from "./index";

export async function getPhotos(): Promise<Photo[]> {
	const rows = await db.select().from(photos).orderBy(desc(photos.createdAt));
	return rows.map(rowToPhoto);
}

export async function getPhotosPaginated(
	page: number,
	limit: number,
): Promise<Photo[]> {
	const offset = (page - 1) * limit;
	return getPhotosPaginatedByOffset(offset, limit);
}

export async function getPhotosPaginatedByOffset(
	offset: number,
	limit: number,
): Promise<Photo[]> {
	const rows = await db
		.select()
		.from(photos)
		.orderBy(desc(photos.createdAt))
		.limit(limit)
		.offset(offset);
	return rows.map(rowToPhoto);
}

export async function getPhotoById(id: string): Promise<Photo | null> {
	const rows = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
	return rows[0] ? rowToPhoto(rows[0]) : null;
}

export async function getPhotoPageData(
	id: string,
	nextLimit = 12,
): Promise<{
	photo: Photo;
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
} | null> {
	const photos = await getPhotos();
	const index = photos.findIndex((photo) => photo.id === id);

	if (index === -1) return null;

	const photo = photos[index];
	const prevPhoto = index > 0 ? photos[index - 1] : null;
	const nextPhoto = index < photos.length - 1 ? photos[index + 1] : null;
	const nextPhotos = photos.slice(index + 1, index + 1 + nextLimit);

	return {
		photo,
		prevPhoto,
		nextPhoto,
		nextPhotos,
	};
}

export async function getUniqueFilms(): Promise<
	Array<{ film: string; count: number }>
> {
	const rows = await db
		.select({ film: photos.filmSimulation })
		.from(photos)
		.where(isNotNull(photos.filmSimulation));

	const counts = new Map<string, number>();

	for (const row of rows) {
		if (!row.film) {
			continue;
		}
		counts.set(row.film, (counts.get(row.film) ?? 0) + 1);
	}

	return Array.from(counts.entries())
		.map(([film, count]) => ({ film, count }))
		.sort((a, b) => a.film.localeCompare(b.film));
}

export async function getPhotosByFilm(
	film: string,
	limit?: number,
): Promise<Photo[]> {
	let query = db
		.select()
		.from(photos)
		.where(eq(photos.filmSimulation, film))
		.orderBy(desc(photos.createdAt));

	if (typeof limit === "number") {
		query = query.limit(limit);
	}

	const rows = await query;
	return rows.map(rowToPhoto);
}

export async function getPhotoPageDataByFilm(
	id: string,
	film: string,
	nextLimit = 12,
): Promise<{
	photo: Photo;
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
	count: number;
} | null> {
	const filmPhotos = await getPhotosByFilm(film);
	const index = filmPhotos.findIndex((photo) => photo.id === id);

	if (index === -1) {
		return null;
	}

	return {
		photo: filmPhotos[index],
		prevPhoto: index > 0 ? filmPhotos[index - 1] : null,
		nextPhoto: index < filmPhotos.length - 1 ? filmPhotos[index + 1] : null,
		nextPhotos: filmPhotos.slice(index + 1, index + 1 + nextLimit),
		count: filmPhotos.length,
	};
}

const yearForPhoto = (photo: Photo): string =>
	String((photo.takenAt ?? photo.createdAt).getUTCFullYear());

const cameraMatches = (photo: Photo, make: string, model: string): boolean =>
	(photo.make ?? "").toLowerCase() === make.toLowerCase() &&
	(photo.model ?? "").toLowerCase() === model.toLowerCase();

export async function getUniqueYears(): Promise<
	Array<{ year: string; count: number }>
> {
	const allPhotos = await getPhotos();
	const counts = new Map<string, number>();

	for (const photo of allPhotos) {
		const year = yearForPhoto(photo);
		counts.set(year, (counts.get(year) ?? 0) + 1);
	}

	return Array.from(counts.entries())
		.map(([year, count]) => ({ year, count }))
		.sort((a, b) => Number(b.year) - Number(a.year));
}

export async function getPhotosByYear(
	year: string,
	limit?: number,
): Promise<Photo[]> {
	const allPhotos = await getPhotos();
	const filtered = allPhotos.filter((photo) => yearForPhoto(photo) === year);
	return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
}

export async function getPhotoPageDataByYear(
	id: string,
	year: string,
	nextLimit = 12,
): Promise<{
	photo: Photo;
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
	count: number;
} | null> {
	const yearPhotos = await getPhotosByYear(year);
	const index = yearPhotos.findIndex((photo) => photo.id === id);

	if (index === -1) {
		return null;
	}

	return {
		photo: yearPhotos[index],
		prevPhoto: index > 0 ? yearPhotos[index - 1] : null,
		nextPhoto: index < yearPhotos.length - 1 ? yearPhotos[index + 1] : null,
		nextPhotos: yearPhotos.slice(index + 1, index + 1 + nextLimit),
		count: yearPhotos.length,
	};
}

export async function getUniqueCameras(): Promise<
	Array<{ make: string; model: string; count: number }>
> {
	const allPhotos = await getPhotos();
	const counts = new Map<string, number>();

	for (const photo of allPhotos) {
		if (!photo.make || !photo.model) {
			continue;
		}

		const key = `${photo.make}|||${photo.model}`;
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}

	return Array.from(counts.entries())
		.map(([key, count]) => {
			const [make, model] = key.split("|||");
			return { make, model, count };
		})
		.sort((a, b) => {
			const makeCmp = a.make.localeCompare(b.make);
			return makeCmp !== 0 ? makeCmp : a.model.localeCompare(b.model);
		});
}

export async function getPhotosByCamera(
	make: string,
	model: string,
	limit?: number,
): Promise<Photo[]> {
	const allPhotos = await getPhotos();
	const filtered = allPhotos.filter((photo) =>
		cameraMatches(photo, make, model),
	);
	return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
}

export async function getPhotoPageDataByCamera(
	id: string,
	make: string,
	model: string,
	nextLimit = 12,
): Promise<{
	photo: Photo;
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
	count: number;
} | null> {
	const cameraPhotos = await getPhotosByCamera(make, model);
	const index = cameraPhotos.findIndex((photo) => photo.id === id);

	if (index === -1) {
		return null;
	}

	return {
		photo: cameraPhotos[index],
		prevPhoto: index > 0 ? cameraPhotos[index - 1] : null,
		nextPhoto: index < cameraPhotos.length - 1 ? cameraPhotos[index + 1] : null,
		nextPhotos: cameraPhotos.slice(index + 1, index + 1 + nextLimit),
		count: cameraPhotos.length,
	};
}

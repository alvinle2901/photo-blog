import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { filmPhotos } from "../db/schema";

export type FilmPhoto = typeof filmPhotos.$inferSelect;
export type NewFilmPhoto = typeof filmPhotos.$inferInsert;

export async function getFilmPhotos(): Promise<FilmPhoto[]> {
	return db.select().from(filmPhotos).orderBy(desc(filmPhotos.createdAt));
}

export async function getFilmPhotosPaginated(
	page: number,
	limit: number,
): Promise<FilmPhoto[]> {
	const offset = (page - 1) * limit;
	return db
		.select()
		.from(filmPhotos)
		.orderBy(desc(filmPhotos.createdAt))
		.limit(limit)
		.offset(offset);
}

export async function getFilmPhotoById(id: string): Promise<FilmPhoto | null> {
	const rows = await db
		.select()
		.from(filmPhotos)
		.where(eq(filmPhotos.id, id))
		.limit(1);
	return rows[0] ?? null;
}

export async function getFilmPhotoPageData(
	id: string,
	nextLimit = 12,
): Promise<{
	photo: FilmPhoto;
	prevPhoto: FilmPhoto | null;
	nextPhoto: FilmPhoto | null;
	nextPhotos: FilmPhoto[];
	count: number;
} | null> {
	const photos = await getFilmPhotos();
	const index = photos.findIndex((photo) => photo.id === id);

	if (index === -1) {
		return null;
	}

	return {
		photo: photos[index],
		prevPhoto: index > 0 ? photos[index - 1] : null,
		nextPhoto: index < photos.length - 1 ? photos[index + 1] : null,
		nextPhotos: photos.slice(index + 1, index + 1 + nextLimit),
		count: photos.length,
	};
}

export async function createFilmPhoto(data: NewFilmPhoto): Promise<FilmPhoto> {
	const rows = await db.insert(filmPhotos).values(data).returning();
	return rows[0];
}

export async function updateFilmPhoto(
	id: string,
	data: Partial<Omit<NewFilmPhoto, "id">>,
): Promise<FilmPhoto | null> {
	const rows = await db
		.update(filmPhotos)
		.set(data)
		.where(eq(filmPhotos.id, id))
		.returning();
	return rows[0] ?? null;
}

export async function deleteFilmPhoto(id: string): Promise<void> {
	await db.delete(filmPhotos).where(eq(filmPhotos.id, id));
}

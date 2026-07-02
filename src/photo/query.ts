import {
	and,
	asc,
	count,
	desc,
	eq,
	inArray,
	isNotNull,
	sql,
} from "drizzle-orm";

import { db, pool } from "../db/client";
import { photos } from "../db/schema";
import { type Photo, rowToPhoto } from "./index";

const photosChronologicalOrder = [
	sql`${photos.takenAt} desc nulls last`,
	desc(photos.createdAt),
] as const;

const photoYearExpression = sql<string>`extract(year from coalesce(${photos.takenAt}, ${photos.createdAt}))`;

export type GridSortType = "createdAt" | "takenAt" | "title";
export type GridSortOrder = "asc" | "desc";

function getGridPhotoOrder(
	sortType: GridSortType = "takenAt",
	sortOrder: GridSortOrder = "desc",
) {
	if (sortType === "createdAt") {
		return sortOrder === "asc"
			? [asc(photos.createdAt)]
			: [desc(photos.createdAt)];
	}

	if (sortType === "title") {
		return sortOrder === "asc"
			? [sql`lower(coalesce(${photos.title}, '')) asc`]
			: [sql`lower(coalesce(${photos.title}, '')) desc`];
	}

	return sortOrder === "asc"
		? [sql`${photos.takenAt} asc nulls last`, desc(photos.createdAt)]
		: [...photosChronologicalOrder];
}

type NearbyPhotoRow = {
	id: string;
	row_number: string;
	current_row_number: string;
};

export async function getPhotos(
	sortType?: GridSortType,
	sortOrder?: GridSortOrder,
): Promise<Photo[]> {
	return getGridPhotos(sortType, sortOrder);
}

export async function getPhotoCount(): Promise<number> {
	const rows = await db.select({ count: count() }).from(photos);
	return rows[0]?.count ?? 0;
}

export async function getGridPhotos(
	sortType?: GridSortType,
	sortOrder?: GridSortOrder,
	offset?: number,
	limit?: number,
): Promise<Photo[]> {
	const query = db
		.select()
		.from(photos)
		.orderBy(...getGridPhotoOrder(sortType, sortOrder));

	const rows =
		typeof limit === "number"
			? await query.limit(limit).offset(offset ?? 0)
			: await query;
	return rows.map(rowToPhoto);
}

export async function getPhotosPaginatedByOffset(
	offset: number,
	limit: number,
): Promise<Photo[]> {
	const rows = await db
		.select()
		.from(photos)
		.orderBy(...photosChronologicalOrder)
		.limit(limit)
		.offset(offset);
	return rows.map(rowToPhoto);
}

export async function getMapPhotos(): Promise<Photo[]> {
	const rows = await db
		.select()
		.from(photos)
		.where(and(isNotNull(photos.latitude), isNotNull(photos.longitude)))
		.orderBy(...photosChronologicalOrder);
	return rows.map(rowToPhoto);
}

export async function getPhotosPaginated(
	page: number,
	limit: number,
): Promise<Photo[]> {
	const offset = (page - 1) * limit;
	return getPhotosPaginatedByOffset(offset, limit);
}

export async function getPhotoById(id: string): Promise<Photo | null> {
	const rows = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
	return rows[0] ? rowToPhoto(rows[0]) : null;
}

async function getPhotosNearId(
	id: string,
	nextLimit: number,
): Promise<{
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
} | null> {
	const { rows } = await pool.query<NearbyPhotoRow>(
		`
			WITH ordered_photos AS (
				SELECT
					id,
					row_number() OVER (
						ORDER BY taken_at DESC NULLS LAST, created_at DESC
					) AS row_number
				FROM photos
			),
			current_photo AS (
				SELECT row_number AS current_row_number
				FROM ordered_photos
				WHERE id = $1
			)
			SELECT
				ordered_photos.*,
				current_photo.current_row_number
			FROM ordered_photos
			CROSS JOIN current_photo
			WHERE ordered_photos.row_number >= current_photo.current_row_number - 1
				AND ordered_photos.row_number <= current_photo.current_row_number + $2
			ORDER BY ordered_photos.row_number ASC
		`,
		[id, nextLimit],
	);

	const currentRowNumber = rows[0]?.current_row_number;
	if (!currentRowNumber) return null;

	const prevRow = rows.find(
		(row) => Number(row.row_number) === Number(currentRowNumber) - 1,
	);
	const nextRows = rows.filter(
		(row) => Number(row.row_number) > Number(currentRowNumber),
	);
	const orderedIds = [prevRow?.id, ...nextRows.map((row) => row.id)].filter(
		(id): id is string => Boolean(id),
	);
	const nearbyRows =
		orderedIds.length > 0
			? await db.select().from(photos).where(inArray(photos.id, orderedIds))
			: [];
	const photosById = new Map(
		nearbyRows.map((row) => [row.id, rowToPhoto(row)] as const),
	);
	const prevPhoto = prevRow ? (photosById.get(prevRow.id) ?? null) : null;
	const nextPhotos = nextRows
		.map((row) => photosById.get(row.id))
		.filter((photo): photo is Photo => Boolean(photo));

	return {
		prevPhoto,
		nextPhoto: nextPhotos[0] ?? null,
		nextPhotos,
	};
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
	const [photo, nearbyPhotos] = await Promise.all([
		getPhotoById(id),
		getPhotosNearId(id, nextLimit),
	]);
	if (!photo || !nearbyPhotos) return null;

	return {
		photo,
		...nearbyPhotos,
	};
}

export async function getUniqueFilms(): Promise<
	Array<{ film: string; count: number }>
> {
	const rows = await db
		.select({ film: photos.filmSimulation, count: count() })
		.from(photos)
		.where(isNotNull(photos.filmSimulation))
		.groupBy(photos.filmSimulation);

	return rows
		.filter((row): row is { film: string; count: number } => Boolean(row.film))
		.sort((a, b) => a.film.localeCompare(b.film));
}

export async function getPhotosByFilm(
	film: string,
	limit?: number,
): Promise<Photo[]> {
	const query = db
		.select()
		.from(photos)
		.where(eq(photos.filmSimulation, film))
		.orderBy(...photosChronologicalOrder);

	const rows =
		typeof limit === "number" ? await query.limit(limit) : await query;
	return rows.map(rowToPhoto);
}

export async function getPhotoCountByFilm(film: string): Promise<number> {
	const rows = await db
		.select({ count: count() })
		.from(photos)
		.where(eq(photos.filmSimulation, film));
	return rows[0]?.count ?? 0;
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

export async function getUniqueYears(): Promise<
	Array<{ year: string; count: number }>
> {
	const rows = await db
		.select({ year: photoYearExpression, count: count() })
		.from(photos)
		.groupBy(photoYearExpression);

	return rows
		.map((row) => ({ year: String(row.year), count: row.count }))
		.sort((a, b) => Number(b.year) - Number(a.year));
}

export async function getPhotosByYear(
	year: string,
	limit?: number,
): Promise<Photo[]> {
	const query = db
		.select()
		.from(photos)
		.where(sql`${photoYearExpression} = ${Number(year)}`)
		.orderBy(...photosChronologicalOrder);

	const rows =
		typeof limit === "number" ? await query.limit(limit) : await query;
	return rows.map(rowToPhoto);
}

export async function getPhotoCountByYear(year: string): Promise<number> {
	const rows = await db
		.select({ count: count() })
		.from(photos)
		.where(sql`${photoYearExpression} = ${Number(year)}`);
	return rows[0]?.count ?? 0;
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
	const rows = await db
		.select({ make: photos.make, model: photos.model, count: count() })
		.from(photos)
		.where(and(isNotNull(photos.make), isNotNull(photos.model)))
		.groupBy(photos.make, photos.model);

	return rows
		.filter((row): row is { make: string; model: string; count: number } =>
			Boolean(row.make && row.model),
		)
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
	const query = db
		.select()
		.from(photos)
		.where(and(eq(photos.make, make), eq(photos.model, model)))
		.orderBy(...photosChronologicalOrder);

	const rows =
		typeof limit === "number" ? await query.limit(limit) : await query;
	return rows.map(rowToPhoto);
}

export async function getPhotoCountByCamera(
	make: string,
	model: string,
): Promise<number> {
	const rows = await db
		.select({ count: count() })
		.from(photos)
		.where(and(eq(photos.make, make), eq(photos.model, model)));
	return rows[0]?.count ?? 0;
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

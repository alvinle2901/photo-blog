import { unstable_cache } from "next/cache";
import { cache } from "react";

import { CACHE_KEYS } from "@/cache/keys";
import {
	getGridPhotos,
	getMapPhotos,
	getPhotoById,
	getPhotoCount,
	getPhotoCountByCamera,
	getPhotoCountByFilm,
	getPhotoCountByYear,
	getPhotoPageData,
	getPhotoPageDataByCamera,
	getPhotoPageDataByFilm,
	getPhotoPageDataByYear,
	getPhotosByCamera,
	getPhotosByFilm,
	getPhotosByYear,
	getPhotosPaginatedByOffset,
	getUniqueCameras,
	getUniqueFilms,
	getUniqueYears,
	type GridSortOrder,
	type GridSortType,
} from "@/photo/query";

export const getPhotoCached = (id: string) =>
	unstable_cache(() => getPhotoById(id), [CACHE_KEYS.photo(id)], {
		tags: [CACHE_KEYS.photos(), CACHE_KEYS.photo(id)],
	})();

export const getPhotoPageDataCached = (id: string, nextLimit = 12) =>
	unstable_cache(
		() => getPhotoPageData(id, nextLimit),
		[CACHE_KEYS.photo(id), `next-${nextLimit}`],
		{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.photo(id)] },
	)();

export const getPhotosPaginatedCached = (offset: number, limit: number) =>
	unstable_cache(
		() => getPhotosPaginatedByOffset(offset, limit),
		[CACHE_KEYS.photos(), `paginated-${offset}-${limit}`],
		{ tags: [CACHE_KEYS.photos()] },
	)();

export const getGridPhotosCached = (
	sortType: GridSortType = "takenAt",
	sortOrder: GridSortOrder = "desc",
	offset?: number,
	limit?: number,
) =>
	unstable_cache(
		() => getGridPhotos(sortType, sortOrder, offset, limit),
		[
			CACHE_KEYS.grid(),
			`${sortType}-${sortOrder}`,
			`offset-${typeof offset === "number" ? offset : "all"}`,
			`limit-${typeof limit === "number" ? limit : "all"}`,
		],
		{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.grid()] },
	)();

export const getPhotoCountCached = unstable_cache(
	getPhotoCount,
	[CACHE_KEYS.photos(), "count"],
	{ tags: [CACHE_KEYS.photos()] },
);

export const getMapPhotosCached = unstable_cache(
	getMapPhotos,
	[CACHE_KEYS.map()],
	{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.map()] },
);

export const getUniqueFilmsCached = unstable_cache(
	getUniqueFilms,
	[CACHE_KEYS.film("all")],
	{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.film("all")] },
);

export const getPhotosByFilmCached = (film: string, limit?: number) =>
	unstable_cache(
		() => getPhotosByFilm(film, limit),
		[
			CACHE_KEYS.film(film),
			`limit-${typeof limit === "number" ? limit : "all"}`,
		],
		{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.film(film)] },
	)();

export const getPhotoCountByFilmCached = (film: string) =>
	unstable_cache(
		() => getPhotoCountByFilm(film),
		[CACHE_KEYS.film(film), "count"],
		{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.film(film)] },
	)();

export const getPhotoPageDataByFilmCached = (
	id: string,
	film: string,
	nextLimit = 12,
) =>
	unstable_cache(
		() => getPhotoPageDataByFilm(id, film, nextLimit),
		[CACHE_KEYS.photo(id), CACHE_KEYS.film(film), `next-${nextLimit}`],
		{
			tags: [CACHE_KEYS.photos(), CACHE_KEYS.photo(id), CACHE_KEYS.film(film)],
		},
	)();

export const getUniqueYearsCached = unstable_cache(
	getUniqueYears,
	[CACHE_KEYS.year("all")],
	{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.year("all")] },
);

export const getPhotosByYearCached = (year: string, limit?: number) =>
	unstable_cache(
		() => getPhotosByYear(year, limit),
		[
			CACHE_KEYS.year(year),
			`limit-${typeof limit === "number" ? limit : "all"}`,
		],
		{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.year(year)] },
	)();

export const getPhotoCountByYearCached = (year: string) =>
	unstable_cache(
		() => getPhotoCountByYear(year),
		[CACHE_KEYS.year(year), "count"],
		{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.year(year)] },
	)();

export const getPhotoPageDataByYearCached = (
	id: string,
	year: string,
	nextLimit = 12,
) =>
	unstable_cache(
		() => getPhotoPageDataByYear(id, year, nextLimit),
		[CACHE_KEYS.photo(id), CACHE_KEYS.year(year), `next-${nextLimit}`],
		{
			tags: [CACHE_KEYS.photos(), CACHE_KEYS.photo(id), CACHE_KEYS.year(year)],
		},
	)();

export const getUniqueCamerasCached = unstable_cache(
	getUniqueCameras,
	[CACHE_KEYS.camera("all", "all")],
	{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.camera("all", "all")] },
);

export const getPhotosByCameraCached = (
	make: string,
	model: string,
	limit?: number,
) =>
	unstable_cache(
		() => getPhotosByCamera(make, model, limit),
		[
			CACHE_KEYS.camera(make, model),
			`limit-${typeof limit === "number" ? limit : "all"}`,
		],
		{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.camera(make, model)] },
	)();

export const getPhotoCountByCameraCached = (make: string, model: string) =>
	unstable_cache(
		() => getPhotoCountByCamera(make, model),
		[CACHE_KEYS.camera(make, model), "count"],
		{ tags: [CACHE_KEYS.photos(), CACHE_KEYS.camera(make, model)] },
	)();

export const getPhotoPageDataByCameraCached = (
	id: string,
	make: string,
	model: string,
	nextLimit = 12,
) =>
	unstable_cache(
		() => getPhotoPageDataByCamera(id, make, model, nextLimit),
		[CACHE_KEYS.photo(id), CACHE_KEYS.camera(make, model), `next-${nextLimit}`],
		{
			tags: [
				CACHE_KEYS.photos(),
				CACHE_KEYS.photo(id),
				CACHE_KEYS.camera(make, model),
			],
		},
	)();

export const getPhotoPageDataForRequest = cache((id: string, nextLimit = 12) =>
	getPhotoPageDataCached(id, nextLimit),
);

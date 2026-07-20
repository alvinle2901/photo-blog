"use server";

import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getIsAdmin } from "../auth/session";
import { CACHE_KEYS } from "../cache/keys";
import { db } from "../db/client";
import { photos } from "../db/schema";
import { storage } from "../storage";
import { getImageStorageKeys } from "../storage/utils";
import type { Photo } from ".";
import { getPhotos, getPhotosPaginated } from "./query";

export async function fetchAllPhotos(): Promise<Photo[]> {
	return getPhotos();
}

export async function fetchPhotosPaginated(
	page: number,
	limit: number,
): Promise<Photo[]> {
	return getPhotosPaginated(page, limit);
}

export async function updatePhoto(
	id: string,
	data: {
		title?: string | null;
		caption?: string | null;
		semanticDescription?: string | null;
		tags?: string[] | null;
		hidden?: boolean;
		priorityOrder?: number | null;
		latitude?: number | null;
		longitude?: number | null;
		locationName?: string | null;
		recipeTitle?: string | null;
		recipeData?: unknown | null;
	},
) {
	if (!(await getIsAdmin())) redirect("/sign-in");

	await db
		.update(photos)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(photos.id, id));

	revalidateTag(CACHE_KEYS.photos(), "max");
	revalidateTag(CACHE_KEYS.photo(id), "max");
}

export async function deletePhoto(id: string) {
	if (!(await getIsAdmin())) redirect("/sign-in");

	const rows = await db
		.select({ url: photos.url })
		.from(photos)
		.where(eq(photos.id, id))
		.limit(1);

	if (!rows[0]) return;

	await Promise.all(
		getImageStorageKeys(rows[0].url).map((key) =>
			storage.delete(key).catch(() => {
				// Best-effort — don't fail the DB delete if storage delete fails
			}),
		),
	);

	await db.delete(photos).where(eq(photos.id, id));

	revalidateTag(CACHE_KEYS.photos(), "max");
	revalidateTag(CACHE_KEYS.photo(id), "max");
}

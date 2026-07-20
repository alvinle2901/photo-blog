"use server";

import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getIsAdmin } from "@/auth/session";
import { db } from "@/db/client";
import { filmPhotos } from "@/db/schema";
import { storage } from "@/storage";
import { getImageStorageKeys } from "@/storage/utils";

import { getFilmPhotos } from "./query";

const FILM_PHOTOS_TAG = "35mm-photos";

export async function fetchAllFilmPhotos() {
	if (!(await getIsAdmin())) redirect("/sign-in");

	return getFilmPhotos();
}

export async function deleteFilmPhoto(id: string) {
	if (!(await getIsAdmin())) redirect("/sign-in");

	const rows = await db
		.select({ url: filmPhotos.url })
		.from(filmPhotos)
		.where(eq(filmPhotos.id, id))
		.limit(1);

	if (!rows[0]) return;

	await Promise.all(
		getImageStorageKeys(rows[0].url).map((key) =>
			storage.delete(key).catch(() => {
				// Best-effort — don't fail the DB delete if storage delete fails
			}),
		),
	);

	await db.delete(filmPhotos).where(eq(filmPhotos.id, id));

	revalidateTag(FILM_PHOTOS_TAG, "max");
	revalidateTag(`35mm-photo-${id}`, "max");
}

import { randomUUID } from "crypto";
import sharp from "sharp";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getIsAdmin } from "@/auth/session";
import { db } from "@/db/client";
import { filmPhotos } from "@/db/schema";
import { storage } from "@/storage";

export async function POST(request: NextRequest) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file") as File | null;

	if (!file) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}

	if (!file.type.startsWith("image/")) {
		return NextResponse.json(
			{ error: "Only image files are supported" },
			{ status: 400 },
		);
	}

	const title = (formData.get("title") as string | null) ?? null;
	const description = (formData.get("description") as string | null) ?? null;
	const film = (formData.get("film") as string | null) ?? null;

	const buffer = Buffer.from(await file.arrayBuffer());

	// Get image dimensions
	const metadata = await sharp(buffer).metadata();
	const width = metadata.width;
	const height = metadata.height;

	if (!width || !height) {
		return NextResponse.json(
			{ error: "Could not read image dimensions" },
			{ status: 400 },
		);
	}

	// Upload to R2
	const id = randomUUID();
	const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
	const key = `35mm/${id}.${ext}`;
	const url = await storage.upload({
		key,
		body: buffer,
		contentType: file.type || "image/jpeg",
	});

	// Insert into DB
	const [row] = await db
		.insert(filmPhotos)
		.values({
			id,
			url,
			title: title || null,
			description: description || null,
			film: film || null,
			width,
			height,
		})
		.returning();

	revalidateTag("35mm-photos", "default");

	return NextResponse.json(row, { status: 201 });
}

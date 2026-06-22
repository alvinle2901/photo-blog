import { getFilmPhotos } from "@/35mm/query";
import { getIsAdmin } from "@/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const photos = await getFilmPhotos();
	return NextResponse.json(photos);
}

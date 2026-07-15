import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getIsAdmin } from "@/auth/session";
import { processUpload } from "@/upload/pipeline";

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

	const buffer = Buffer.from(await file.arrayBuffer());

	const photo = await processUpload({
		buffer,
		fileName: file.name,
		contentType: file.type || "image/jpeg",
	});

	revalidateTag("photos", "default");

	return NextResponse.json(photo, { status: 201 });
}

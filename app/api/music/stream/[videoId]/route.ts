import { eq } from "drizzle-orm";
import { connection } from "next/server";

import { db } from "@/db/client";
import { createMusicWorkerStreamUrl } from "@/music/worker-client";

export const maxDuration = 30;

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	await connection();

	const { videoId } = await params;
	if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
		return Response.json({ error: "Invalid videoId" }, { status: 400 });
	}

	const track = await db.query.musicTracks.findFirst({
		where: (table) => eq(table.youtubeVideoId, videoId),
	});
	if (!track) {
		return Response.json({ error: "Video not in playlist" }, { status: 403 });
	}

	return Response.json(
		{
			mimeType: "audio/webm",
			url: createMusicWorkerStreamUrl(`/api/worker/music/audio/${videoId}`),
		},
		{
			headers: {
				"Cache-Control": "private, no-store",
			},
		},
	);
}

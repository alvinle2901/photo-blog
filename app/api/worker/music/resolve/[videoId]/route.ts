import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { isMusicWorkerRequestAuthorized } from "@/music/worker-auth";
import { getYouTubeStreamUrl } from "@/music/youtube";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	if (!isMusicWorkerRequestAuthorized(request)) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

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

	const stream = await getYouTubeStreamUrl(videoId);
	if (!stream) {
		return Response.json(
			{ error: "Could not resolve stream URL" },
			{ status: 502 },
		);
	}

	return Response.json(stream, {
		headers: { "Cache-Control": "private, no-store" },
	});
}

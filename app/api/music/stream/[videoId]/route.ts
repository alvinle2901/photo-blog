import { eq } from "drizzle-orm";
import { connection } from "next/server";

import { db } from "@/db/client";
import {
	getYouTubeStreamUrl,
	YouTubeStreamResolutionError,
} from "@/music/youtube";

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

	try {
		const stream = await getYouTubeStreamUrl(videoId);
		return Response.json(stream, {
			headers: {
				"Cache-Control": "public, s-maxage=18000, stale-while-revalidate=300",
			},
		});
	} catch (error) {
		return Response.json(
			{
				detail:
					error instanceof YouTubeStreamResolutionError
						? error.message
						: "Unknown stream resolution error",
				error: "Could not resolve stream URL",
			},
			{ status: 502 },
		);
	}
}

import { eq } from "drizzle-orm";
import { connection } from "next/server";

import { db } from "@/db/client";
import { MusicWorkerError, requestMusicWorker } from "@/music/worker-client";

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
		const workerResponse = await requestMusicWorker(
			`/api/worker/music/resolve/${videoId}`,
		);
		if (!workerResponse.ok) {
			return Response.json(
				{ error: "Music worker could not resolve this track." },
				{ status: 502 },
			);
		}

		const stream = (await workerResponse.json()) as {
			mimeType: string;
			url: string;
		};
		return Response.json(stream, {
			headers: {
				"Cache-Control": "public, s-maxage=18000, stale-while-revalidate=300",
			},
		});
	} catch (error) {
		const message =
			error instanceof MusicWorkerError
				? error.message
				: "Music worker is unavailable.";
		return Response.json({ error: message }, { status: 502 });
	}
}

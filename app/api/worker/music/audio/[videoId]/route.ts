import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { isMusicWorkerStreamRequestAuthorized } from "@/music/worker-auth";
import {
	getYouTubeStreamUrl,
	invalidateYouTubeStreamUrl,
	YouTubeStreamResolutionError,
} from "@/music/youtube";

export const maxDuration = 60;

const AUDIO_RESPONSE_HEADERS = {
	"Access-Control-Allow-Headers": "Range",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Expose-Headers":
		"Accept-Ranges, Content-Length, Content-Range",
};

export function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: AUDIO_RESPONSE_HEADERS,
	});
}

async function fetchAudioStream(url: string, request: Request) {
	return fetch(url, {
		headers: {
			...(request.headers.get("range")
				? { Range: request.headers.get("range") as string }
				: {}),
		},
		cache: "no-store",
	});
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	const { videoId } = await params;
	const path = `/api/worker/music/audio/${videoId}`;
	if (!isMusicWorkerStreamRequestAuthorized(request, path)) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

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
		let stream = await getYouTubeStreamUrl(videoId);
		if (!stream) {
			return Response.json(
				{ error: "Could not resolve stream URL" },
				{ status: 502 },
			);
		}

		let upstream = await fetchAudioStream(stream.url, request);
		if ([403, 404, 410, 429, 500, 502, 503, 504].includes(upstream.status)) {
			invalidateYouTubeStreamUrl(videoId);
			stream = await getYouTubeStreamUrl(videoId);
			if (!stream) {
				return Response.json(
					{ error: "Could not refresh stream URL" },
					{ status: 502 },
				);
			}
			upstream = await fetchAudioStream(stream.url, request);
		}

		if (!upstream.ok && upstream.status !== 206) {
			return Response.json(
				{ error: "Upstream audio request failed." },
				{ status: 502 },
			);
		}

		const headers = new Headers({
			...AUDIO_RESPONSE_HEADERS,
			"Accept-Ranges": upstream.headers.get("accept-ranges") ?? "bytes",
			"Cache-Control": "private, no-store",
			"Content-Type": upstream.headers.get("content-type") ?? stream.mimeType,
		});

		for (const header of ["content-length", "content-range"]) {
			const value = upstream.headers.get(header);
			if (value) headers.set(header, value);
		}

		return new Response(upstream.body, {
			status: upstream.status,
			headers,
		});
	} catch (error) {
		return Response.json(
			{
				detail:
					error instanceof YouTubeStreamResolutionError
						? error.message
						: "Unknown stream proxy error",
				error: "Could not proxy stream URL",
			},
			{ status: 502 },
		);
	}
}

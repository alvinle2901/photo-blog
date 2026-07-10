import { z } from "zod";

import { getIsAdmin } from "@/auth/session";
import { playSpotifyTrack } from "@/music/spotify";

const playbackRequestSchema = z.object({
	deviceId: z.string().min(1).max(128),
	trackId: z.string().regex(/^[A-Za-z0-9]{22}$/),
});

export async function POST(request: Request) {
	if (!(await getIsAdmin())) {
		return Response.json(
			{ error: "Authentication required." },
			{ status: 401 },
		);
	}

	const body = await request.json().catch(() => null);
	const parsed = playbackRequestSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ error: "Invalid playback request." },
			{ status: 400 },
		);
	}

	try {
		const started = await playSpotifyTrack(
			parsed.data.deviceId,
			parsed.data.trackId,
		);
		if (!started) {
			return Response.json(
				{ error: "Spotify is not configured." },
				{ status: 503 },
			);
		}

		return Response.json({ started: true });
	} catch (error) {
		console.error("Unable to start Spotify playback", error);
		return Response.json(
			{ error: "Unable to start Spotify playback." },
			{ status: 502 },
		);
	}
}

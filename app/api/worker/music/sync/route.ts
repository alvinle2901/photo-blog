import { z } from "zod";

import { startMusicPlaylistSync } from "@/music/sync-playlist";
import { isMusicWorkerRequestAuthorized } from "@/music/worker-auth";

const requestSchema = z.object({
	playlistId: z.string().regex(/^[A-Za-z0-9]+$/),
});

export const maxDuration = 60;

export async function POST(request: Request) {
	if (!isMusicWorkerRequestAuthorized(request)) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const parsed = requestSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ error: "Invalid playlist ID" }, { status: 400 });
	}

	await startMusicPlaylistSync(parsed.data.playlistId);

	return Response.json({ status: "running" }, { status: 202 });
}

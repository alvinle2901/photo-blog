import { NextResponse } from "next/server";

import { getIsAdmin } from "@/auth/session";
import { db } from "@/db/client";
import { startMusicPlaylistSync } from "@/music/sync-playlist";

function parsePlaylistId(value: string) {
	const id = value.match(/playlist\/([A-Za-z0-9]+)/)?.[1] ?? value;
	return /^[A-Za-z0-9]+$/.test(id) ? id : null;
}

export async function GET() {
	if (!(await getIsAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const row = await db.query.appConfig.findFirst({
		where: (table, { eq }) => eq(table.key, "music_sync_status"),
	});

	return NextResponse.json({ status: row?.value ?? "idle" });
}

export async function POST(request: Request) {
	if (!(await getIsAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await request.json().catch(() => null)) as {
		playlistId?: string;
	} | null;
	const playlistId = body?.playlistId?.trim()
		? parsePlaylistId(body.playlistId.trim())
		: null;
	if (!playlistId) {
		return NextResponse.json(
			{ error: "A valid playlist ID is required." },
			{ status: 400 },
		);
	}

	try {
		await startMusicPlaylistSync(playlistId);
		return NextResponse.json({ status: "running" }, { status: 202 });
	} catch (error) {
		console.error("Unable to start music sync", error);
		return NextResponse.json(
			{ error: "Unable to start music sync." },
			{ status: 502 },
		);
	}
}

import { asc, eq } from "drizzle-orm";
import { connection } from "next/server";

import { db } from "@/db/client";
import { appConfig, musicTracks } from "@/db/schema";

export async function GET() {
	await connection();

	const playlistIdRow = await db.query.appConfig.findFirst({
		where: (t, { eq: eqFn }) => eqFn(t.key, "music_playlist_id"),
	});
	const playlistId = playlistIdRow?.value;

	if (!playlistId) {
		return Response.json(
			{ tracks: [], playlistName: null },
			{ headers: { "Cache-Control": "no-store" } },
		);
	}

	const playlistNameRow = await db.query.appConfig.findFirst({
		where: (t, { eq: eqFn }) => eqFn(t.key, "music_playlist_name"),
	});

	const tracks = await db
		.select()
		.from(musicTracks)
		.where(eq(musicTracks.playlistSpotifyId, playlistId))
		.orderBy(asc(musicTracks.position));

	const playable = tracks.filter((t) => t.youtubeVideoId !== null);

	return Response.json(
		{
			playlistId,
			playlistName: playlistNameRow?.value ?? playlistId,
			tracks: playable.map((t) => ({
				id: t.spotifyId,
				name: t.name,
				artistNames: t.artistNames,
				albumName: t.albumName,
				albumArtUrl: t.albumArtUrl,
				spotifyUrl: t.spotifyUrl,
				youtubeVideoId: t.youtubeVideoId,
			})),
		},
		{ headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
	);
}

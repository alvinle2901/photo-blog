import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { appConfig, musicTracks } from "@/db/schema";

import { fetchSpotifyPlaylistAllTracks } from "./spotify";
import { searchYouTubeMusic } from "./youtube";

async function setSyncStatus(value: string) {
	await db
		.insert(appConfig)
		.values({ key: "music_sync_status", value })
		.onConflictDoUpdate({
			target: appConfig.key,
			set: { value, updatedAt: new Date() },
		});
}

export async function startMusicPlaylistSync(playlistId: string) {
	await setSyncStatus("running");
	void runMusicPlaylistSync(playlistId);
}

async function runMusicPlaylistSync(playlistId: string) {
	try {
		const { playlistName, tracks } =
			await fetchSpotifyPlaylistAllTracks(playlistId);

		await db
			.delete(musicTracks)
			.where(eq(musicTracks.playlistSpotifyId, playlistId));

		let matched = 0;

		for (let index = 0; index < tracks.length; index++) {
			const track = tracks[index];
			const videoId = await searchYouTubeMusic(
				`${track.name} ${track.artistNames}`,
			);

			if (videoId) matched++;

			await db.insert(musicTracks).values({
				spotifyId: track.spotifyId,
				name: track.name,
				artistNames: track.artistNames,
				albumName: track.albumName,
				albumArtUrl: track.albumArtUrl,
				spotifyUrl: track.spotifyUrl,
				youtubeVideoId: videoId,
				playlistSpotifyId: playlistId,
				position: index,
			});

			await new Promise((resolve) => setTimeout(resolve, 200));
		}

		await setSyncStatus(`done:${matched}/${tracks.length}`);
		await db
			.insert(appConfig)
			.values({ key: "music_playlist_id", value: playlistId })
			.onConflictDoUpdate({
				target: appConfig.key,
				set: { value: playlistId, updatedAt: new Date() },
			});
		await db
			.insert(appConfig)
			.values({ key: "music_playlist_name", value: playlistName })
			.onConflictDoUpdate({
				target: appConfig.key,
				set: { value: playlistName, updatedAt: new Date() },
			});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Sync failed";
		await setSyncStatus(`failed:${message.slice(0, 90)}`);
		console.error("Music playlist sync failed", error);
	}
}

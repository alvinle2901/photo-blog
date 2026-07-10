import { config } from "@/config";
import { db } from "@/db/client";
import { appConfig } from "@/db/schema";

import type { MusicTrack } from ".";

type SpotifyTokenResponse = {
	access_token?: string;
	refresh_token?: string;
};

type SpotifyTopTracksResponse = {
	items?: Array<{
		album?: {
			images?: Array<{ url: string }>;
			name?: string;
		};
		artists?: Array<{ name: string }>;
		external_urls?: { spotify?: string };
		id?: string;
		name?: string;
	}>;
};

async function refreshSpotifyAccessToken() {
	const credentials = getSpotifyCredentials();
	if (!credentials) return null;

	const tokenBody = new URLSearchParams({
		grant_type: "refresh_token",
		refresh_token: credentials.refreshToken,
	});
	const tokenHeaders = new Headers({
		"Content-Type": "application/x-www-form-urlencoded",
	});

	if (credentials.clientSecret) {
		tokenHeaders.set(
			"Authorization",
			`Basic ${Buffer.from(
				`${credentials.clientId}:${credentials.clientSecret}`,
			).toString("base64")}`,
		);
	} else {
		tokenBody.set("client_id", credentials.clientId);
	}

	const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: tokenHeaders,
		body: tokenBody,
		cache: "no-store",
	});

	if (!tokenResponse.ok) {
		throw new Error(`Spotify token refresh failed: ${tokenResponse.status}`);
	}

	const token = (await tokenResponse.json()) as SpotifyTokenResponse;
	if (!token.access_token) throw new Error("Spotify returned no access token");

	return token.access_token;
}

function getSpotifyCredentials() {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
	const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

	if (!clientId || !refreshToken) return null;

	return { clientId, clientSecret, refreshToken };
}

export function getSpotifyAuthorizationConfig() {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

	if (!clientId || !clientSecret) return null;

	return { clientId, clientSecret };
}

/** Machine-to-machine token — no user OAuth needed for public playlists. */
export async function getSpotifyClientToken(): Promise<string | null> {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
	if (!clientId || !clientSecret) return null;

	const res = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
		},
		body: "grant_type=client_credentials",
		cache: "no-store",
	});
	if (!res.ok) return null;
	const data = (await res.json()) as SpotifyTokenResponse;
	return data.access_token ?? null;
}

type SpotifyPlaylistTrackItem = {
	album?: { images?: Array<{ url: string }>; name?: string };
	artists?: Array<{ name: string }>;
	external_urls?: { spotify?: string };
	id?: string;
	name?: string;
};

// The base playlist endpoint returns items as a paging object:
// { items: { href, items: [{item: track, ...}], next } }
type SpotifyPlaylistPageResponse = {
	name?: string;
	items?: {
		items?: Array<{ item?: SpotifyPlaylistTrackItem }>;
		next?: string | null;
	};
};

export type SpotifyRawTrack = {
	spotifyId: string;
	name: string;
	artistNames: string;
	albumName: string;
	albumArtUrl: string | null;
	spotifyUrl: string | null;
};

/**
 * Fetches all tracks from a Spotify playlist.
 * Uses the user refresh token — client credentials cannot read playlist tracks.
 */
export async function fetchSpotifyPlaylistAllTracks(
	playlistId: string,
): Promise<{ playlistName: string; tracks: SpotifyRawTrack[] }> {
	const accessToken = await refreshSpotifyAccessToken();
	if (!accessToken) throw new Error("Could not get Spotify access token. Check SPOTIFY_REFRESH_TOKEN.");

	const tracks: SpotifyRawTrack[] = [];

	const firstRes = await fetch(
		`https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}`,
		{ headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
	);
	if (!firstRes.ok) {
		throw new Error(`Spotify playlist fetch failed: ${firstRes.status}`);
	}
	const firstData = (await firstRes.json()) as SpotifyPlaylistPageResponse;
	const playlistName = (firstData as { name?: string }).name ?? playlistId;

	const collectItems = (
		items: Array<{ item?: SpotifyPlaylistTrackItem }>,
	) => {
		for (const entry of items) {
			const t = entry.item;
			if (!t?.id || !t.name) continue;
			tracks.push({
				spotifyId: t.id,
				name: t.name,
				artistNames: (t.artists ?? []).map((a) => a.name).join(", "),
				albumName: t.album?.name ?? "",
				albumArtUrl: t.album?.images?.[0]?.url ?? null,
				spotifyUrl: t.external_urls?.spotify ?? null,
			});
		}
	};

	collectItems(firstData.items?.items ?? []);

	let nextUrl = firstData.items?.next ?? null;
	while (nextUrl) {
		const pageRes = await fetch(nextUrl, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: "no-store",
		});
		if (!pageRes.ok) break;
		const pageData = (await pageRes.json()) as {
			items?: Array<{ item?: SpotifyPlaylistTrackItem }>;
			next?: string | null;
		};
		collectItems(pageData.items ?? []);
		nextUrl = pageData.next ?? null;
	}

	return { playlistName, tracks };
}

export function getSpotifyRedirectUri() {
	return (
		process.env.SPOTIFY_REDIRECT_URI ??
		new URL("/api/music/callback", config.NEXT_PUBLIC_SITE_URL).toString()
	);
}

export async function exchangeSpotifyAuthorizationCode(code: string) {
	const authorization = getSpotifyAuthorizationConfig();
	if (!authorization) return null;

	const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${Buffer.from(
				`${authorization.clientId}:${authorization.clientSecret}`,
			).toString("base64")}`,
		},
		body: new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: getSpotifyRedirectUri(),
		}),
		cache: "no-store",
	});

	if (!tokenResponse.ok) {
		throw new Error(`Spotify authorization failed: ${tokenResponse.status}`);
	}

	return (await tokenResponse.json()) as SpotifyTokenResponse;
}

export async function getSpotifyPlaybackAccessToken() {
	return refreshSpotifyAccessToken();
}

export async function playSpotifyTrack(deviceId: string, trackId: string) {
	const accessToken = await refreshSpotifyAccessToken();
	if (!accessToken) return false;

	// Play directly on the SDK device without transferring the active Spotify
	// Connect session — keeps the site player isolated from other devices.
	const playbackResponse = await fetch(
		`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
			cache: "no-store",
		},
	);

	if (!playbackResponse.ok) {
		throw new Error(
			`Spotify playback start failed: ${playbackResponse.status}`,
		);
	}

	return true;
}

export async function getSpotifyTopTracks(): Promise<MusicTrack[] | null> {
	const accessToken = await refreshSpotifyAccessToken();
	if (!accessToken) return null;

	const tracksResponse = await fetch(
		"https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=20",
		{
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: "no-store",
		},
	);

	if (!tracksResponse.ok) {
		throw new Error(
			`Spotify top tracks request failed: ${tracksResponse.status}`,
		);
	}

	const data = (await tracksResponse.json()) as SpotifyTopTracksResponse;

	return (data.items ?? []).flatMap((track): MusicTrack[] => {
		const id = track.id;
		const name = track.name;
		const spotifyUrl = track.external_urls?.spotify;

		if (!id || !name || !spotifyUrl) return [];

		return [
			{
				id,
				name,
				spotifyUrl,
				artistNames: (track.artists ?? [])
					.map((artist) => artist.name)
					.join(", "),
				albumName: track.album?.name ?? "",
				albumArtUrl: track.album?.images?.[0]?.url ?? null,
			},
		];
	});
}

type SpotifyPlaylistTracksResponse = {
	name?: string;
	items?: {
		items?: Array<{
			item?: {
				album?: {
					images?: Array<{ url: string }>;
					name?: string;
				};
				artists?: Array<{ name: string }>;
				external_urls?: { spotify?: string };
				id?: string;
				name?: string;
			};
		}>;
	};
};

export async function getSpotifyPlaylistTracks(
	playlistId: string,
): Promise<{ tracks: MusicTrack[]; sourceLabel: string } | null> {
	const accessToken = await refreshSpotifyAccessToken();
	if (!accessToken) return null;

	// Use the base playlist endpoint — the /tracks sub-endpoint is restricted
	// by Spotify's API quota policy; items are returned at the top level.
	const tracksResponse = await fetch(
		`https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}`,
		{
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: "no-store",
		},
	);

	if (!tracksResponse.ok) {
		if (tracksResponse.status === 403) {
			throw new Error(
				"Spotify playlist access denied (403). Re-authorize at /api/music/authorize to grant playlist-read-private scope, then update SPOTIFY_REFRESH_TOKEN.",
			);
		}
		throw new Error(
			`Spotify playlist tracks request failed: ${tracksResponse.status}`,
		);
	}

	const data =
		(await tracksResponse.json()) as SpotifyPlaylistTracksResponse;

	const tracks = (data.items?.items ?? []).flatMap((item): MusicTrack[] => {
		const track = item.item;
		const id = track?.id;
		const name = track?.name;
		const spotifyUrl = track?.external_urls?.spotify;

		if (!id || !name || !spotifyUrl) return [];

		return [
			{
				id,
				name,
				spotifyUrl,
				artistNames: (track.artists ?? [])
					.map((artist) => artist.name)
					.join(", "),
				albumName: track.album?.name ?? "",
				albumArtUrl: track.album?.images?.[0]?.url ?? null,
			},
		];
	});

	return { tracks, sourceLabel: data.name ?? playlistId };
}

export async function getMusicBarTracks(): Promise<{
	tracks: MusicTrack[];
	sourceLabel?: string;
} | null> {
	const row = await db.query.appConfig.findFirst({
		where: (t, { eq }) => eq(t.key, "music_playlist_id"),
	});
	const playlistId = row?.value;
	if (playlistId) {
		try {
			const result = await getSpotifyPlaylistTracks(playlistId);
			if (result) return result;
		} catch (error) {
			console.error("Playlist fetch failed, falling back to top tracks:", error);
		}
	}
	const tracks = await getSpotifyTopTracks();
	return tracks ? { tracks, sourceLabel: "TOP 20 / 4 WEEKS" } : null;
}

export async function getMusicPlaylistId(): Promise<string | null> {
	const row = await db.query.appConfig.findFirst({
		where: (t, { eq }) => eq(t.key, "music_playlist_id"),
	});
	return row?.value ?? null;
}

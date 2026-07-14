import { config } from "@/config";

type SpotifyTokenResponse = {
	access_token?: string;
	refresh_token?: string;
};

type MusicTrack = {
	albumArtUrl: string | null;
	albumName: string;
	artistNames: string;
	id: string;
	name: string;
	spotifyUrl: string;
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
	if (!accessToken) {
		throw new Error(
			"Could not get Spotify access token. Check SPOTIFY_REFRESH_TOKEN.",
		);
	}

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

	const collectItems = (items: Array<{ item?: SpotifyPlaylistTrackItem }>) => {
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

export async function getMusicBarTracks(): Promise<{
	tracks: MusicTrack[];
	sourceLabel?: string;
} | null> {
	const tracks = await getSpotifyTopTracks();
	return tracks ? { tracks, sourceLabel: "TOP 20 / 4 WEEKS" } : null;
}

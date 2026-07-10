import { config } from "@/config";

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

	const headers = {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	};
	const transferResponse = await fetch("https://api.spotify.com/v1/me/player", {
		method: "PUT",
		headers,
		body: JSON.stringify({ device_ids: [deviceId], play: false }),
		cache: "no-store",
	});

	if (!transferResponse.ok) {
		throw new Error(
			`Spotify playback transfer failed: ${transferResponse.status}`,
		);
	}

	const playbackResponse = await fetch(
		`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
		{
			method: "PUT",
			headers,
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

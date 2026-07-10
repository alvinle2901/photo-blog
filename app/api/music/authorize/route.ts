import { randomUUID } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import { getIsAdmin } from "@/auth/session";
import {
	getSpotifyAuthorizationConfig,
	getSpotifyRedirectUri,
} from "@/music/spotify";

const OAUTH_STATE_COOKIE = "spotify-oauth-state";

export async function GET(request: NextRequest) {
	if (!(await getIsAdmin())) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	const authorization = getSpotifyAuthorizationConfig();
	if (!authorization) {
		return Response.json(
			{ error: "Spotify client credentials are not configured." },
			{ status: 503 },
		);
	}

	const redirectUri = getSpotifyRedirectUri();
	const state = randomUUID();
	const spotifyAuthorizeUrl = new URL("https://accounts.spotify.com/authorize");
	spotifyAuthorizeUrl.search = new URLSearchParams({
		client_id: authorization.clientId,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: "streaming user-read-email user-read-private user-modify-playback-state user-top-read",
		state,
	}).toString();

	const response = NextResponse.redirect(spotifyAuthorizeUrl);
	response.cookies.set(OAUTH_STATE_COOKIE, state, {
		httpOnly: true,
		maxAge: 600,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});

	return response;
}

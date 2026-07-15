import { type NextRequest, NextResponse } from "next/server";

import { exchangeSpotifyAuthorizationCode } from "@/music/spotify";

const OAUTH_STATE_COOKIE = "spotify-oauth-state";

function responseWithNoStore(body: string, status = 200) {
	return new NextResponse(body, {
		status,
		headers: {
			"Cache-Control": "no-store",
			"Content-Type": "text/plain; charset=utf-8",
			"Referrer-Policy": "no-referrer",
			"X-Robots-Tag": "noindex, nofollow",
		},
	});
}

export async function GET(request: NextRequest) {
	const error = request.nextUrl.searchParams.get("error");
	const code = request.nextUrl.searchParams.get("code");
	const state = request.nextUrl.searchParams.get("state");
	const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

	if (error) {
		return responseWithNoStore(
			`Spotify authorization was not granted: ${error}`,
			400,
		);
	}

	if (!code || !state || state !== expectedState) {
		return responseWithNoStore(
			"Spotify authorization could not be verified.",
			400,
		);
	}

	try {
		const token = await exchangeSpotifyAuthorizationCode(code);
		if (!token?.refresh_token) {
			return responseWithNoStore(
				"Spotify did not return a refresh token. Start the authorization flow again.",
				502,
			);
		}

		const response = responseWithNoStore(
			`Spotify connected. Add this value to your environment:\n\nSPOTIFY_REFRESH_TOKEN=${token.refresh_token}\n`,
		);
		response.cookies.delete(OAUTH_STATE_COOKIE);
		return response;
	} catch (error) {
		console.error("Unable to complete Spotify authorization", error);
		return responseWithNoStore("Spotify authorization failed. Try again.", 502);
	}
}

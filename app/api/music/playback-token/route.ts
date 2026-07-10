import { getIsAdmin } from "@/auth/session";
import { getSpotifyPlaybackAccessToken } from "@/music/spotify";

export async function GET() {
	if (!(await getIsAdmin())) {
		return Response.json(
			{ error: "Authentication required." },
			{ status: 401 },
		);
	}

	try {
		const accessToken = await getSpotifyPlaybackAccessToken();
		if (!accessToken) {
			return Response.json(
				{ error: "Spotify is not configured." },
				{ status: 503 },
			);
		}

		return Response.json(
			{ accessToken },
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch (error) {
		console.error("Unable to create Spotify playback token", error);
		return Response.json(
			{ error: "Unable to start Spotify playback." },
			{ status: 502 },
		);
	}
}

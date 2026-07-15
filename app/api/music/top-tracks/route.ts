import { getSpotifyTopTracks } from "@/music/spotify";

const CACHE_CONTROL = "public, s-maxage=900, stale-while-revalidate=3600";

export async function GET() {
	try {
		const tracks = await getSpotifyTopTracks();

		if (!tracks) {
			return Response.json(
				{ tracks: [] },
				{ headers: { "Cache-Control": CACHE_CONTROL } },
			);
		}

		return Response.json(
			{ tracks },
			{ headers: { "Cache-Control": CACHE_CONTROL } },
		);
	} catch (error) {
		console.error("Unable to load Spotify top tracks", error);
		return Response.json(
			{ error: "Unable to load music." },
			{ status: 502, headers: { "Cache-Control": "no-store" } },
		);
	}
}

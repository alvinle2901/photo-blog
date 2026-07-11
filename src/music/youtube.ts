import { execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Innertube } from "youtubei.js";

import { db } from "@/db/client";

// ─── Innertube singleton ──────────────────────────────────────────────────────

let _searchInstance: Innertube | null = null;

async function getSearchInstance(): Promise<Innertube> {
	if (_searchInstance) return _searchInstance;
	_searchInstance = await Innertube.create({ retrieve_player: false });
	return _searchInstance;
}

type YouTubeSearchItem = { id?: string; video_id?: string };

type YouTubeSearchResponse = {
	contents?: Array<{
		contents?: YouTubeSearchItem[];
		type?: string;
	}>;
	results?: YouTubeSearchItem[];
	videos?: YouTubeSearchItem[];
};

/** Search YouTube Music for a track query and return the top videoId. */
export async function searchYouTubeMusic(
	query: string,
): Promise<string | null> {
	try {
		const yt = await getSearchInstance();
		const results = await yt.music.search(query, { type: "song" });

		const response = results as unknown as YouTubeSearchResponse;
		const musicShelf = response.contents?.find(
			(section) =>
				section.type === "MusicShelf" && (section.contents?.length ?? 0) > 0,
		);
		const videoId = musicShelf?.contents?.[0]?.id;
		return videoId ?? null;
	} catch {
		// Fall back to basic YouTube search
		try {
			const yt = await getSearchInstance();
			const results = await yt.search(query, { type: "video" });
			const response = results as unknown as YouTubeSearchResponse;
			const first = response.videos?.[0] ?? response.results?.[0];
			const videoId = first?.id ?? first?.video_id;
			return videoId ?? null;
		} catch {
			return null;
		}
	}
}

// Resolve yt-dlp binary — configurable via env var, falls back to common paths
const YT_DLP =
	process.env.YT_DLP_PATH ??
	[
		"/opt/homebrew/bin/yt-dlp",
		"/usr/local/bin/yt-dlp",
		"/usr/bin/yt-dlp",
		"yt-dlp",
	].find((p) => {
		try {
			execSync(`"${p}" --version`, { stdio: "ignore" });
			return true;
		} catch {
			return false;
		}
	}) ??
	"yt-dlp";
const YT_DLP_TIMEOUT_MS = 15_000;

export class YouTubeStreamResolutionError extends Error {}

function getYtDlpErrorDetail(error: unknown) {
	const commandError = error as { message?: string; stderr?: string | Buffer };
	const detail =
		commandError.stderr?.toString().trim() ??
		commandError.message ??
		"Unknown error";

	return detail
		.replaceAll(/https?:\/\/\S+/g, "[url]")
		.replaceAll(/\s+/g, " ")
		.slice(0, 1_000);
}

// In-memory cache: videoId → { url, expiresAt, mimeType }
const streamCache = new Map<
	string,
	{ url: string; mimeType: string; expiresAt: number }
>();

// Cookies temp file — written once from DB, reused across requests
let _cookiesFile: string | null = null;
let _cookiesLoadedAt = 0;
const COOKIES_TTL = 30 * 60 * 1000; // reload from DB every 30min

async function getCookiesFile(): Promise<string | null> {
	if (
		_cookiesFile &&
		existsSync(_cookiesFile) &&
		Date.now() - _cookiesLoadedAt < COOKIES_TTL
	) {
		return _cookiesFile;
	}
	try {
		const row = await db.query.appConfig.findFirst({
			where: (t, { eq: eqFn }) => eqFn(t.key, "youtube_cookies"),
		});
		if (!row?.value) return null;
		const file = join(tmpdir(), "yt-cookies-server.txt");
		writeFileSync(file, row.value, "utf8");
		_cookiesFile = file;
		_cookiesLoadedAt = Date.now();
		return file;
	} catch {
		return null;
	}
}

/**
 * Get a direct audio stream URL for a YouTube videoId.
 * Priority:
 *   1. DB-stored cookies (works in production)
 *   2. --cookies-from-browser (works in local dev)
 * Caches for 5.5 hours (stream URLs expire in ~6h).
 */
export async function getYouTubeStreamUrl(videoId: string): Promise<{
	url: string;
	mimeType: string;
} | null> {
	const cached = streamCache.get(videoId);
	if (cached && cached.expiresAt > Date.now()) {
		return { url: cached.url, mimeType: cached.mimeType };
	}

	let streamUrl: string | null = null;
	let failureDetail = "No YouTube cookies are stored in the database.";

	// ── 1. Try DB-stored cookies ──────────────────────────────────────────────
	const cookiesFile = await getCookiesFile();
	if (cookiesFile) {
		try {
			const raw = execSync(
				`${YT_DLP} --cookies "${cookiesFile}" -f bestaudio -g --no-playlist -- "${videoId}"`,
				{
					timeout: YT_DLP_TIMEOUT_MS,
					encoding: "utf8",
					stdio: ["ignore", "pipe", "pipe"],
				},
			).trim();
			streamUrl = raw.split("\n")[0].trim() || null;
		} catch (e) {
			failureDetail = getYtDlpErrorDetail(e);
			console.error(`[stream] DB-cookies yt-dlp failed: ${failureDetail}`);
		}
	} else {
		console.warn("[stream] No cookies in DB");
	}

	// ── 2. Fall back to browser cookies (local dev) ───────────────────────────
	if (!streamUrl && process.env.NODE_ENV !== "production") {
		for (const browser of ["chrome", "firefox", "safari", "edge"]) {
			try {
				const raw = execSync(
					`${YT_DLP} --cookies-from-browser ${browser} -f bestaudio -g --no-playlist -- "${videoId}"`,
					{
						timeout: YT_DLP_TIMEOUT_MS,
						encoding: "utf8",
						stdio: ["ignore", "pipe", "pipe"],
					},
				).trim();
				streamUrl = raw.split("\n")[0].trim() || null;
				if (streamUrl) break;
			} catch (e) {
				failureDetail = getYtDlpErrorDetail(e);
				console.error(`[stream] ${browser} cookies failed: ${failureDetail}`);
			}
		}
	}

	if (!streamUrl) throw new YouTubeStreamResolutionError(failureDetail);

	const mimeType =
		streamUrl.includes("mime=audio%2Fwebm") ||
		streamUrl.includes("mime=audio/webm")
			? "audio/webm; codecs=opus"
			: "audio/mp4";

	const result = { url: streamUrl, mimeType };
	streamCache.set(videoId, {
		...result,
		expiresAt: Date.now() + 5.5 * 60 * 60 * 1000,
	});
	return result;
}

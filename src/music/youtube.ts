import { execFileSync, execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { BG } from "bgutils-js";
import { Innertube } from "youtubei.js";

import { db } from "@/db/client";

// ─── Search instance (no player needed) ──────────────────────────────────────

let _searchInstance: Innertube | null = null;

async function getSearchInstance(): Promise<Innertube> {
	if (_searchInstance) return _searchInstance;
	_searchInstance = await Innertube.create({ retrieve_player: false });
	return _searchInstance;
}

// ─── Stream instance with poToken ────────────────────────────────────────────

let _streamInstance: Innertube | null = null;
let _streamInstanceAt = 0;
const STREAM_INSTANCE_TTL = 5.5 * 60 * 60 * 1000; // refresh every 5.5h

type BotGuardGlobalKey =
	| "document"
	| "location"
	| "navigator"
	| "self"
	| "window";

const BOT_GUARD_GLOBAL_KEYS: BotGuardGlobalKey[] = [
	"document",
	"location",
	"navigator",
	"self",
	"window",
];

function restoreBotGuardGlobals(
	target: Record<string, unknown>,
	previous: Map<BotGuardGlobalKey, PropertyDescriptor | undefined>,
) {
	for (const key of BOT_GUARD_GLOBAL_KEYS) {
		const descriptor = previous.get(key);
		if (descriptor) {
			Object.defineProperty(target, key, descriptor);
		} else {
			delete target[key];
		}
	}
}

function setTemporaryGlobal(
	target: Record<string, unknown>,
	key: BotGuardGlobalKey,
	value: unknown,
) {
	const descriptor = Object.getOwnPropertyDescriptor(target, key);
	if (!descriptor || descriptor.configurable) {
		Object.defineProperty(target, key, {
			configurable: true,
			enumerable: descriptor?.enumerable ?? false,
			value,
			writable: true,
		});
		return;
	}

	target[key] = value;
}

function installBotGuardGlobals() {
	const botGuardGlobal = globalThis as Record<string, unknown>;
	const previous = new Map<BotGuardGlobalKey, PropertyDescriptor | undefined>(
		BOT_GUARD_GLOBAL_KEYS.map((key) => [
			key,
			Object.getOwnPropertyDescriptor(botGuardGlobal, key),
		]),
	);

	try {
		setTemporaryGlobal(botGuardGlobal, "window", botGuardGlobal);
		setTemporaryGlobal(botGuardGlobal, "self", botGuardGlobal);
		if (botGuardGlobal.navigator == null) {
			setTemporaryGlobal(botGuardGlobal, "navigator", {
				userAgent:
					"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
			});
		}
		if (botGuardGlobal.location == null) {
			setTemporaryGlobal(botGuardGlobal, "location", {
				ancestorOrigins: [],
				hash: "",
				host: "www.youtube.com",
				hostname: "www.youtube.com",
				href: "https://www.youtube.com/",
				origin: "https://www.youtube.com",
				pathname: "/",
				port: "",
				protocol: "https:",
				search: "",
			});
		}
		if (botGuardGlobal.document == null) {
			setTemporaryGlobal(botGuardGlobal, "document", {
				createElement: () => ({}),
				getElementById: () => null,
				head: { appendChild: () => undefined },
			});
		}

		return {
			globalObj: botGuardGlobal,
			restore: () => restoreBotGuardGlobals(botGuardGlobal, previous),
		};
	} catch (error) {
		restoreBotGuardGlobals(botGuardGlobal, previous);
		throw error;
	}
}

async function loadBotGuardVm(
	challenge: Awaited<ReturnType<typeof BG.Challenge.create>>,
) {
	if (!challenge) throw new Error("BG challenge returned null");

	const script =
		challenge.interpreterJavascript
			.privateDoNotAccessOrElseSafeScriptWrappedValue;
	const scriptUrl =
		challenge.interpreterJavascript
			.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue;

	if (script) {
		Function(script)();
		return challenge;
	}

	if (scriptUrl) {
		const response = await fetch(
			scriptUrl.startsWith("//") ? `https:${scriptUrl}` : scriptUrl,
		);
		if (!response.ok) {
			throw new Error(`BG script fetch failed with ${response.status}`);
		}
		Function(await response.text())();
		return challenge;
	}

	throw new Error("BG challenge did not include an interpreter script");
}

async function getStreamInstance(): Promise<Innertube> {
	if (_streamInstance && Date.now() - _streamInstanceAt < STREAM_INSTANCE_TTL) {
		return _streamInstance;
	}

	// 1. Get visitor_data from a bare instance
	const base = await Innertube.create({ retrieve_player: false });
	const visitorData =
		(base.session.context.client as { visitorData?: string }).visitorData ?? "";

	// 2. Generate poToken via BotGuard
	try {
		const botGuardGlobal = installBotGuardGlobals();
		const bgConfig = {
			fetch: (url: string | URL | Request, options?: RequestInit) =>
				fetch(url, options),
			globalObj: botGuardGlobal.globalObj,
			identifier: visitorData,
			requestKey: "O43z0dpjhgX20SCx4KAo",
		};
		const poToken = await (async () => {
			try {
				const challenge = await loadBotGuardVm(
					await BG.Challenge.create(bgConfig),
				);

				const result = await BG.PoToken.generate({
					program: challenge.program,
					globalName: challenge.globalName,
					bgConfig,
				});
				return result.poToken;
			} finally {
				botGuardGlobal.restore();
			}
		})();

		_streamInstance = await Innertube.create({
			po_token: poToken,
			visitor_data: visitorData,
		});
		console.info("[stream] Innertube stream instance created with poToken");
	} catch (e) {
		console.warn(
			"[stream] poToken generation failed, falling back to unauthenticated:",
			(e as Error).message,
		);
		_streamInstance = await Innertube.create();
	}

	const streamInstance = _streamInstance;
	_streamInstanceAt = Date.now();
	return streamInstance;
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
const YT_DLP_TIMEOUT_MS = 25_000;
const YT_DLP_JS_RUNTIME =
	process.env.YT_DLP_JS_RUNTIME ?? "node:/usr/local/bin/node";
const YT_DLP_REMOTE_COMPONENT =
	process.env.YT_DLP_REMOTE_COMPONENT ?? "ejs:github";

export class YouTubeStreamResolutionError extends Error {}

function getYtDlpErrorDetail(error: unknown) {
	const commandError = error as {
		message?: string;
		stderr?: string | Buffer;
		status?: number;
		signal?: string;
	};
	const detail =
		(commandError.stderr?.toString().trim() || commandError.message) ??
		"Unknown error";
	const status =
		commandError.status !== undefined ? `status ${commandError.status}: ` : "";
	const signal = commandError.signal ? `signal ${commandError.signal}: ` : "";

	return `${status}${signal}${detail}`
		.replaceAll(/https?:\/\/\S+/g, "[url]")
		.replaceAll(/\s+/g, " ")
		.slice(0, 1_000);
}

async function runYtDlpStreamUrl(args: string[]) {
	let lastError: unknown;

	for (let attempt = 1; attempt <= 2; attempt += 1) {
		try {
			const raw = execFileSync(YT_DLP, args, {
				timeout: YT_DLP_TIMEOUT_MS,
				encoding: "utf8",
				stdio: ["ignore", "pipe", "pipe"],
			}).trim();
			return raw.split("\n")[0].trim() || null;
		} catch (error) {
			lastError = error;
			if (attempt < 2) {
				await new Promise((resolve) => setTimeout(resolve, 1_000));
			}
		}
	}

	throw lastError;
}

// In-memory cache: videoId → { url, expiresAt, mimeType }
const streamCache = new Map<
	string,
	{ url: string; mimeType: string; expiresAt: number }
>();
const pendingStreamResolutions = new Map<
	string,
	Promise<{ url: string; mimeType: string } | null>
>();

export function invalidateYouTubeStreamUrl(videoId: string) {
	streamCache.delete(videoId);
}

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

	const pending = pendingStreamResolutions.get(videoId);
	if (pending) return pending;

	const resolution = resolveYouTubeStreamUrl(videoId, cached).finally(() => {
		pendingStreamResolutions.delete(videoId);
	});
	pendingStreamResolutions.set(videoId, resolution);
	return resolution;
}

async function resolveYouTubeStreamUrl(
	videoId: string,
	staleCache?: { url: string; mimeType: string; expiresAt: number },
): Promise<{
	url: string;
	mimeType: string;
} | null> {
	let streamUrl: string | null = null;
	let failureDetail = "No YouTube cookies are stored in the database.";

	// ── 0. Try Innertube with poToken first ───────────────────────────────────
	try {
		const yt = await getStreamInstance();
		const info = await yt.getBasicInfo(videoId);
		const formats = info.streaming_data?.adaptive_formats ?? [];
		const best = formats
			.filter(
				(f) =>
					f.has_audio &&
					!f.has_video &&
					(f.mime_type.includes("audio/webm") ||
						f.mime_type.includes("audio/mp4")),
			)
			.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];

		if (best?.url) {
			const result = { url: best.url, mimeType: best.mime_type };
			streamCache.set(videoId, {
				...result,
				expiresAt: Date.now() + 5.5 * 60 * 60 * 1000,
			});
			return result;
		}
	} catch (e) {
		console.warn(
			"[stream] Innertube+poToken failed, falling back to yt-dlp:",
			(e as Error).message,
		);
	}

	// ── 1. Try DB-stored cookies ──────────────────────────────────────────────
	const cookiesFile = await getCookiesFile();
	if (cookiesFile) {
		try {
			streamUrl = await runYtDlpStreamUrl([
				"--cookies",
				cookiesFile,
				"--js-runtimes",
				YT_DLP_JS_RUNTIME,
				"--remote-components",
				YT_DLP_REMOTE_COMPONENT,
				"-f",
				"bestaudio",
				"-g",
				"--no-playlist",
				"--",
				videoId,
			]);
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
				streamUrl = await runYtDlpStreamUrl([
					"--cookies-from-browser",
					browser,
					"--js-runtimes",
					YT_DLP_JS_RUNTIME,
					"--remote-components",
					YT_DLP_REMOTE_COMPONENT,
					"-f",
					"bestaudio",
					"-g",
					"--no-playlist",
					"--",
					videoId,
				]);
				if (streamUrl) break;
			} catch (e) {
				failureDetail = getYtDlpErrorDetail(e);
				console.error(`[stream] ${browser} cookies failed: ${failureDetail}`);
			}
		}
	}

	if (!streamUrl) {
		if (staleCache && Date.now() - staleCache.expiresAt < 30 * 60 * 1000) {
			console.warn(
				"[stream] YouTube resolve failed; reusing recently expired stream URL:",
				failureDetail,
			);
			return { url: staleCache.url, mimeType: staleCache.mimeType };
		}

		throw new YouTubeStreamResolutionError(failureDetail);
	}

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

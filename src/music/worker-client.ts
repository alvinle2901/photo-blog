import { createHmac } from "node:crypto";

// Keep this below Vercel's function timeout so the music bar gets a useful
// error response instead of a platform-level 504 while Render is cold.
const WORKER_TIMEOUT_MS = 25_000;
const STREAM_URL_TTL_MS = 10 * 60 * 1000;

export class MusicWorkerError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
	}
}

function getWorkerUrl() {
	const url = process.env.MUSIC_WORKER_URL;
	const secret = process.env.MUSIC_WORKER_SECRET;

	if (!url || !secret) {
		throw new MusicWorkerError("Music worker is not configured.", 503);
	}

	return { secret, url: url.replace(/\/$/, "") };
}

function signWorkerPath(path: string, expiresAt: number, secret: string) {
	return createHmac("sha256", secret)
		.update(`${path}:${expiresAt}`)
		.digest("base64url");
}

export function createMusicWorkerStreamUrl(path: string) {
	const { secret, url } = getWorkerUrl();
	const expiresAt = Date.now() + STREAM_URL_TTL_MS;
	const signature = signWorkerPath(path, expiresAt, secret);
	const streamUrl = new URL(`${url}${path}`);
	streamUrl.searchParams.set("exp", String(expiresAt));
	streamUrl.searchParams.set("sig", signature);
	return streamUrl.toString();
}

export async function requestMusicWorker(path: string, init: RequestInit = {}) {
	const { secret, url } = getWorkerUrl();
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), WORKER_TIMEOUT_MS);

	try {
		const response = await fetch(`${url}${path}`, {
			...init,
			headers: {
				Authorization: `Bearer ${secret}`,
				...init.headers,
			},
			signal: controller.signal,
			cache: "no-store",
		});

		return response;
	} catch (error) {
		if (error instanceof MusicWorkerError) throw error;
		if (error instanceof Error && error.name === "AbortError") {
			throw new MusicWorkerError("Music worker timed out. Try again.", 504);
		}
		throw new MusicWorkerError("Music worker is unavailable.", 502);
	} finally {
		clearTimeout(timeout);
	}
}

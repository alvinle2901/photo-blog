const WORKER_TIMEOUT_MS = 55_000;

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
		throw new MusicWorkerError("Music worker is unavailable.", 502);
	} finally {
		clearTimeout(timeout);
	}
}

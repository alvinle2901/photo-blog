import { createHmac, timingSafeEqual } from "node:crypto";

const AUTHORIZATION_PREFIX = "Bearer ";

export function isMusicWorkerRequestAuthorized(request: Request) {
	const secret = process.env.MUSIC_WORKER_SECRET;
	const authorization = request.headers.get("authorization");

	if (!secret || !authorization?.startsWith(AUTHORIZATION_PREFIX)) {
		return false;
	}

	const token = authorization.slice(AUTHORIZATION_PREFIX.length);
	if (token.length !== secret.length) return false;

	return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
}

function safeEqual(left: string, right: string) {
	if (left.length !== right.length) return false;
	return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export function isMusicWorkerStreamRequestAuthorized(
	request: Request,
	path: string,
) {
	const secret = process.env.MUSIC_WORKER_SECRET;
	if (!secret) return false;

	const url = new URL(request.url);
	const expiresAt = Number(url.searchParams.get("exp"));
	const signature = url.searchParams.get("sig");
	if (!Number.isFinite(expiresAt) || !signature || expiresAt < Date.now()) {
		return false;
	}

	const expected = createHmac("sha256", secret)
		.update(`${path}:${expiresAt}`)
		.digest("base64url");
	return safeEqual(signature, expected);
}

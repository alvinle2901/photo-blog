import { timingSafeEqual } from "node:crypto";

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

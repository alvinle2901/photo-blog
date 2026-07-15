import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import { config } from "../config";

export type SessionData = {
	isAdmin: boolean;
};

const sessionOptions = {
	password: config.AUTH_SECRET,
	cookieName: "photo-blog-session",
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "lax" as const,
		maxAge: 60 * 60 * 24 * 7, // 7 days
	},
};

export async function getSession(): Promise<IronSession<SessionData>> {
	const cookieStore = await cookies();
	return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getIsAdmin(): Promise<boolean> {
	const session = await getSession();
	return session.isAdmin === true;
}

/** Verify credentials — timing-safe compare */
export function verifyCredentials(email: string, password: string): boolean {
	const { timingSafeEqual } = require("crypto") as typeof import("crypto");
	const emailMatch = timingSafeEqual(
		Buffer.from(email),
		Buffer.from(config.ADMIN_EMAIL),
	);
	const passwordMatch = timingSafeEqual(
		Buffer.from(password),
		Buffer.from(config.ADMIN_PASSWORD),
	);
	return emailMatch && passwordMatch;
}

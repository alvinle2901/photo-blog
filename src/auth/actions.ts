"use server";

import { redirect } from "next/navigation";
import { getSession, verifyCredentials } from "@/auth/session";

export async function signIn(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	let valid = false;
	try {
		valid = !!(email && password && verifyCredentials(email, password));
	} catch {
		// timingSafeEqual throws if buffers differ in length — treat as invalid
		valid = false;
	}

	if (!valid) {
		redirect("/sign-in?error=1");
	}

	const session = await getSession();
	session.isAdmin = true;
	await session.save();

	redirect("/admin");
}

export async function signOut() {
	const session = await getSession();
	session.destroy();
	redirect("/sign-in");
}

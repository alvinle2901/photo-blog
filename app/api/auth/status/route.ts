import { NextResponse } from "next/server";
import { getIsAdmin } from "@/auth/session";

export async function GET() {
	const isUserLoggedIn = await getIsAdmin();
	return NextResponse.json({ isUserLoggedIn });
}

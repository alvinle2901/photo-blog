import { getIsAdmin } from "@/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
	const isUserLoggedIn = await getIsAdmin();
	return NextResponse.json({ isUserLoggedIn });
}

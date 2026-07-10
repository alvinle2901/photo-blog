import { connection } from "next/server";

export async function GET() {
	await connection();

	return Response.json(
		{ status: "ok" },
		{
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Cache-Control": "no-store",
			},
		},
	);
}

import { readFileSync } from "node:fs";
import { extname, join } from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import pg from "pg";

const { Pool } = pg;

function parseEnvValue(value) {
	const trimmed = value.trim();

	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}

	return trimmed;
}

function loadEnvFile(fileName) {
	try {
		const contents = readFileSync(join(process.cwd(), fileName), "utf8");

		for (const line of contents.split(/\r?\n/)) {
			const trimmed = line.trim();

			if (!trimmed || trimmed.startsWith("#")) {
				continue;
			}

			const separatorIndex = trimmed.indexOf("=");

			if (separatorIndex === -1) {
				continue;
			}

			const key = trimmed.slice(0, separatorIndex).trim();
			const value = parseEnvValue(trimmed.slice(separatorIndex + 1));

			if (!(key in process.env)) {
				process.env[key] = value;
			}
		}
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}
}

function requiredEnv(key) {
	const value = process.env[key];

	if (!value) {
		throw new Error(`Missing required env var: ${key}`);
	}

	return value;
}

function extensionForUrl(url, contentType) {
	const pathname = new URL(url).pathname;
	const extension = extname(pathname).replace(".", "").toLowerCase();

	if (extension) {
		return extension;
	}

	if (contentType?.includes("png")) return "png";
	if (contentType?.includes("webp")) return "webp";
	if (contentType?.includes("gif")) return "gif";
	if (contentType?.includes("avif")) return "avif";

	return "jpg";
}

async function downloadImage(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`download failed with ${response.status}`);
	}

	const contentType = response.headers.get("content-type") ?? "image/jpeg";

	if (!contentType.startsWith("image/")) {
		throw new Error(`unexpected content type: ${contentType}`);
	}

	const body = Buffer.from(await response.arrayBuffer());

	return {
		body,
		contentType,
		extension: extensionForUrl(url, contentType),
	};
}

async function uploadToR2({ key, body, contentType, config }) {
	const client = new S3Client({
		region: "auto",
		endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: config.R2_ACCESS_KEY_ID,
			secretAccessKey: config.R2_SECRET_ACCESS_KEY,
		},
	});

	await client.send(
		new PutObjectCommand({
			Bucket: config.R2_BUCKET,
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	);

	return `${config.R2_PUBLIC_URL}/${key}`;
}

async function main() {
	loadEnvFile(".env");
	loadEnvFile(".env.local");

	const args = new Set(process.argv.slice(2));
	const apply = args.has("--apply");
	const limitArg = process.argv
		.slice(2)
		.find((arg) => arg.startsWith("--limit="))
		?.split("=")[1];
	const limit = limitArg ? Number.parseInt(limitArg, 10) : undefined;

	if (limit !== undefined && (!Number.isFinite(limit) || limit < 1)) {
		throw new Error("--limit must be a positive integer");
	}

	const config = {
		DATABASE_URL: requiredEnv("DATABASE_URL"),
		R2_ACCOUNT_ID: requiredEnv("R2_ACCOUNT_ID"),
		R2_ACCESS_KEY_ID: requiredEnv("R2_ACCESS_KEY_ID"),
		R2_SECRET_ACCESS_KEY: requiredEnv("R2_SECRET_ACCESS_KEY"),
		R2_BUCKET: requiredEnv("R2_BUCKET"),
		R2_PUBLIC_URL: requiredEnv("R2_PUBLIC_URL"),
	};

	const pool = new Pool({ connectionString: config.DATABASE_URL });

	try {
		const rowsResult = await pool.query(
			[
				"select id, url from film_photos where url like $1 order by created_at desc",
				limit ? "limit $2" : "",
			]
				.filter(Boolean)
				.join(" "),
			limit ? ["%utfs.io%", limit] : ["%utfs.io%"],
		);
		const rows = rowsResult.rows;

		if (rows.length === 0) {
			console.log("No 35mm utfs.io images found.");
			return;
		}

		console.log(
			`${apply ? "Migrating" : "Dry run:"} ${rows.length} 35mm image${
				rows.length === 1 ? "" : "s"
			} from utfs.io to R2.`,
		);

		const results = [];

		for (const row of rows) {
			try {
				const downloaded = await downloadImage(row.url);
				const key = `35mm/${row.id}.${downloaded.extension}`;

				if (!apply) {
					results.push({ id: row.id, status: "dry-run" });
					console.log(`[dry-run] ${row.id} -> ${key}`);
					continue;
				}

				const nextUrl = await uploadToR2({
					key,
					body: downloaded.body,
					contentType: downloaded.contentType,
					config,
				});

				const updatedRows = await pool.query(
					"update film_photos set url = $1 where id = $2 and url = $3 returning id",
					[nextUrl, row.id, row.url],
				);

				if (updatedRows.rowCount === 0) {
					results.push({ id: row.id, status: "skipped" });
					console.log(`[skipped] ${row.id}: row changed before update`);
					continue;
				}

				results.push({ id: row.id, status: "migrated" });
				console.log(`[migrated] ${row.id} -> ${nextUrl}`);
			} catch (error) {
				results.push({ id: row.id, status: "failed" });
				console.error(
					`[failed] ${row.id}: ${
						error instanceof Error ? error.message : String(error)
					}`,
				);
			}
		}

		const migrated = results.filter(
			(result) => result.status === "migrated",
		).length;
		const failed = results.filter(
			(result) => result.status === "failed",
		).length;
		const skipped = results.filter(
			(result) => result.status === "skipped",
		).length;

		console.log(
			`Done. migrated=${migrated} skipped=${skipped} failed=${failed} dryRun=${
				apply ? 0 : results.length
			}`,
		);

		if (failed > 0) {
			process.exitCode = 1;
		}
	} finally {
		await pool.end();
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

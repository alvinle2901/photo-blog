import { readFileSync } from "node:fs";
import { extname, join } from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import pg from "pg";
import sharp from "sharp";

const { Pool } = pg;

const optimizedSizes = [
	{ suffix: "sm", width: 200, quality: 90 },
	{ suffix: "md", width: 640, quality: 90 },
	{ suffix: "lg", width: 1080, quality: 80 },
];

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

function keyFromPublicUrl(url, publicUrl) {
	const publicPrefix = publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;

	if (!url.startsWith(publicPrefix)) {
		throw new Error(`URL is not under R2 public URL: ${url}`);
	}

	return decodeURIComponent(url.slice(publicPrefix.length));
}

function optimizedKey(originalKey, suffix) {
	const dot = originalKey.lastIndexOf(".");
	const base = dot !== -1 ? originalKey.slice(0, dot) : originalKey;
	return `${base}-${suffix}.jpg`;
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

	return Buffer.from(await response.arrayBuffer());
}

async function generateVariants(original) {
	return Promise.all(
		optimizedSizes.map(async ({ suffix, width, quality }) => {
			const buffer = await sharp(original)
				.rotate()
				.resize(width, undefined, { withoutEnlargement: true })
				.toFormat("jpeg", { quality })
				.toBuffer();

			return { suffix, buffer };
		}),
	);
}

async function uploadToR2({ client, bucket, key, body }) {
	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body,
			ContentType: "image/jpeg",
		}),
	);
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
	const client = new S3Client({
		region: "auto",
		endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: config.R2_ACCESS_KEY_ID,
			secretAccessKey: config.R2_SECRET_ACCESS_KEY,
		},
	});

	try {
		const rowsResult = await pool.query(
			[
				"select id, url from film_photos where url like $1 order by created_at desc",
				limit ? "limit $2" : "",
			]
				.filter(Boolean)
				.join(" "),
			limit
				? [`${config.R2_PUBLIC_URL}/35mm/%`, limit]
				: [`${config.R2_PUBLIC_URL}/35mm/%`],
		);
		const rows = rowsResult.rows.filter((row) => {
			const extension = extname(new URL(row.url).pathname).toLowerCase();
			return (
				!["-sm.jpg", "-md.jpg", "-lg.jpg"].some((suffix) =>
					row.url.endsWith(suffix),
				) && [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(extension)
			);
		});

		if (rows.length === 0) {
			console.log("No 35mm R2 originals found for variant generation.");
			return;
		}

		console.log(
			`${apply ? "Generating" : "Dry run:"} optimized variants for ${
				rows.length
			} 35mm image${rows.length === 1 ? "" : "s"}.`,
		);

		const results = [];

		for (const row of rows) {
			try {
				const originalKey = keyFromPublicUrl(row.url, config.R2_PUBLIC_URL);
				const original = await downloadImage(row.url);
				const variants = await generateVariants(original);

				if (!apply) {
					console.log(
						`[dry-run] ${row.id} -> ${variants
							.map(({ suffix }) => optimizedKey(originalKey, suffix))
							.join(", ")}`,
					);
					results.push({ status: "dry-run" });
					continue;
				}

				await Promise.all(
					variants.map(({ suffix, buffer }) =>
						uploadToR2({
							client,
							bucket: config.R2_BUCKET,
							key: optimizedKey(originalKey, suffix),
							body: buffer,
						}),
					),
				);

				console.log(`[generated] ${row.id}`);
				results.push({ status: "generated" });
			} catch (error) {
				console.error(
					`[failed] ${row.id}: ${
						error instanceof Error ? error.message : String(error)
					}`,
				);
				results.push({ status: "failed" });
			}
		}

		const generated = results.filter(
			(result) => result.status === "generated",
		).length;
		const failed = results.filter(
			(result) => result.status === "failed",
		).length;

		console.log(
			`Done. generated=${generated} failed=${failed} dryRun=${
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

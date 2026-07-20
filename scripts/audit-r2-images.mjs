import {
	DeleteObjectsCommand,
	ListObjectsV2Command,
	S3Client,
} from "@aws-sdk/client-s3";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const { Pool } = pg;

const optimizedSuffixes = ["sm", "md", "lg"];
const imageKeyPattern = /\.(avif|gif|heic|heif|jpe?g|png|webp)$/i;
const defaultLargeThresholdBytes = 5 * 1024 * 1024;

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

function parseArgs(argv) {
	const args = {
		deleteUnused: false,
		yes: false,
		prefixes: [],
		reportPath: null,
		largeThresholdBytes: defaultLargeThresholdBytes,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];

		if (arg === "--delete-unused") {
			args.deleteUnused = true;
			continue;
		}

		if (arg === "--yes") {
			args.yes = true;
			continue;
		}

		if (arg === "--prefix") {
			const value = argv[index + 1];
			if (!value) throw new Error("--prefix requires a value");
			args.prefixes.push(value);
			index += 1;
			continue;
		}

		if (arg === "--report") {
			const value = argv[index + 1];
			if (!value) throw new Error("--report requires a value");
			args.reportPath = value;
			index += 1;
			continue;
		}

		if (arg === "--max-size-mb") {
			const value = Number(argv[index + 1]);
			if (!Number.isFinite(value) || value <= 0) {
				throw new Error("--max-size-mb requires a positive number");
			}
			args.largeThresholdBytes = value * 1024 * 1024;
			index += 1;
			continue;
		}

		throw new Error(`Unknown argument: ${arg}`);
	}

	if (args.prefixes.length === 0) {
		args.prefixes.push("");
	}

	return args;
}

function keyFromPublicUrl(url, publicUrl) {
	const publicPrefix = publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;

	if (!url.startsWith(publicPrefix)) {
		return null;
	}

	return decodeURIComponent(url.slice(publicPrefix.length));
}

function optimizedKey(originalKey, suffix) {
	const dot = originalKey.lastIndexOf(".");
	const base = dot !== -1 ? originalKey.slice(0, dot) : originalKey;
	return `${base}-${suffix}.jpg`;
}

function referencedKeysForUrl(url, publicUrl) {
	const key = keyFromPublicUrl(url, publicUrl);
	if (!key) return [];

	return [key, ...optimizedSuffixes.map((suffix) => optimizedKey(key, suffix))];
}

function formatBytes(bytes) {
	const units = ["B", "KB", "MB", "GB"];
	let value = bytes;
	let unitIndex = 0;

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}

	return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

async function fetchDbReferences(pool, publicUrl) {
	const result = await pool.query(`
		select 'photos' as table_name, id, url from photos
		union all
		select 'film_photos' as table_name, id, url from film_photos
	`);
	const usedKeys = new Set();
	const referencesByKey = new Map();
	const skippedUrls = [];

	for (const row of result.rows) {
		const keys = referencedKeysForUrl(row.url, publicUrl);

		if (keys.length === 0) {
			skippedUrls.push(row);
			continue;
		}

		for (const key of keys) {
			usedKeys.add(key);

			const references = referencesByKey.get(key) ?? [];
			references.push({ table: row.table_name, id: row.id, url: row.url });
			referencesByKey.set(key, references);
		}
	}

	return {
		rowCount: result.rows.length,
		referencesByKey,
		skippedUrls,
		usedKeys,
	};
}

async function listObjects(client, bucket, prefixes) {
	const objects = [];

	for (const prefix of prefixes) {
		let continuationToken;

		do {
			const response = await client.send(
				new ListObjectsV2Command({
					Bucket: bucket,
					Prefix: prefix || undefined,
					ContinuationToken: continuationToken,
				}),
			);

			for (const object of response.Contents ?? []) {
				if (!object.Key) continue;
				objects.push({
					key: object.Key,
					lastModified: object.LastModified?.toISOString() ?? null,
					size: object.Size ?? 0,
				});
			}

			continuationToken = response.NextContinuationToken;
		} while (continuationToken);
	}

	const deduped = new Map();

	for (const object of objects) {
		deduped.set(object.key, object);
	}

	return [...deduped.values()].sort((a, b) => a.key.localeCompare(b.key));
}

async function deleteObjects(client, bucket, keys) {
	const deleted = [];
	const errors = [];

	for (let index = 0; index < keys.length; index += 1000) {
		const batch = keys.slice(index, index + 1000);
		const response = await client.send(
			new DeleteObjectsCommand({
				Bucket: bucket,
				Delete: {
					Objects: batch.map((Key) => ({ Key })),
					Quiet: false,
				},
			}),
		);

		deleted.push(...(response.Deleted ?? []).map((item) => item.Key));
		errors.push(...(response.Errors ?? []));
	}

	return { deleted, errors };
}

function summarizeList(title, objects, limit = 30) {
	console.log(`\n${title}: ${objects.length}`);

	for (const object of objects.slice(0, limit)) {
		const usedLabel =
			typeof object.used === "boolean"
				? `, ${object.used ? "used" : "unused"}`
				: "";
		console.log(`- ${object.key} (${formatBytes(object.size)}${usedLabel})`);
	}

	if (objects.length > limit) {
		console.log(`...and ${objects.length - limit} more`);
	}
}

async function main() {
	loadEnvFile(".env.local");
	loadEnvFile(".env");

	const args = parseArgs(process.argv.slice(2));
	const config = {
		DATABASE_URL: requiredEnv("DATABASE_URL"),
		R2_ACCOUNT_ID: requiredEnv("R2_ACCOUNT_ID"),
		R2_ACCESS_KEY_ID: requiredEnv("R2_ACCESS_KEY_ID"),
		R2_SECRET_ACCESS_KEY: requiredEnv("R2_SECRET_ACCESS_KEY"),
		R2_BUCKET: requiredEnv("R2_BUCKET"),
		R2_PUBLIC_URL: requiredEnv("R2_PUBLIC_URL"),
	};

	if (args.deleteUnused && !args.yes) {
		throw new Error("Refusing to delete without --yes");
	}

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
		const [dbReferences, allObjects] = await Promise.all([
			fetchDbReferences(pool, config.R2_PUBLIC_URL),
			listObjects(client, config.R2_BUCKET, args.prefixes),
		]);

		const imageObjects = allObjects.filter((object) =>
			imageKeyPattern.test(object.key),
		);
		const unusedImages = imageObjects.filter(
			(object) => !dbReferences.usedKeys.has(object.key),
		);
		const largeImages = imageObjects
			.filter((object) => object.size > args.largeThresholdBytes)
			.map((object) => ({
				...object,
				references: dbReferences.referencesByKey.get(object.key) ?? [],
				used: dbReferences.usedKeys.has(object.key),
			}));

		const report = {
			generatedAt: new Date().toISOString(),
			bucket: config.R2_BUCKET,
			prefixes: args.prefixes,
			largeThresholdBytes: args.largeThresholdBytes,
			counts: {
				dbRows: dbReferences.rowCount,
				dbReferencedKeys: dbReferences.usedKeys.size,
				storageObjects: allObjects.length,
				imageObjects: imageObjects.length,
				unusedImages: unusedImages.length,
				largeImages: largeImages.length,
				skippedDbUrls: dbReferences.skippedUrls.length,
			},
			unusedImages,
			largeImages,
			skippedDbUrls: dbReferences.skippedUrls,
		};

		console.log("R2 image audit");
		console.log(`Bucket: ${config.R2_BUCKET}`);
		console.log(`Prefixes: ${args.prefixes.join(", ") || "(all)"}`);
		console.log(`DB rows: ${report.counts.dbRows}`);
		console.log(`Referenced keys: ${report.counts.dbReferencedKeys}`);
		console.log(`Storage image objects: ${report.counts.imageObjects}`);
		console.log(
			`Large threshold: ${formatBytes(args.largeThresholdBytes)}`,
		);

		summarizeList("Unused images", unusedImages);
		summarizeList("Images over threshold", largeImages);

		if (dbReferences.skippedUrls.length > 0) {
			console.log(
				`\nSkipped DB URLs outside R2_PUBLIC_URL: ${dbReferences.skippedUrls.length}`,
			);
		}

		if (args.reportPath) {
			writeFileSync(args.reportPath, `${JSON.stringify(report, null, 2)}\n`);
			console.log(`\nWrote report: ${args.reportPath}`);
		}

		if (args.deleteUnused) {
			const keys = unusedImages.map((object) => object.key);
			const result = await deleteObjects(client, config.R2_BUCKET, keys);

			console.log(`\nDeleted unused images: ${result.deleted.length}`);

			if (result.errors.length > 0) {
				console.log(`Delete errors: ${result.errors.length}`);
				for (const error of result.errors.slice(0, 20)) {
					console.log(`- ${error.Key}: ${error.Message}`);
				}
			}
		} else {
			console.log(
				"\nDry run only. Run with --delete-unused --yes to delete unused images.",
			);
		}
	} finally {
		await pool.end();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

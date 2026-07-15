import { readFileSync } from "node:fs";
import { extname, join } from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { convertRgbToOklab, parseHex } from "culori";
import { extractColors } from "extract-colors";
import { FastAverageColor } from "fast-average-color";
import pg from "pg";
import sharp from "sharp";

const { Pool } = pg;

const DEFAULT_CSV_PATH = "/Users/alvinle29/Downloads/photos.csv";
const optimizedSizes = [
	{ suffix: "sm", width: 200, quality: 90 },
	{ suffix: "md", width: 640, quality: 90 },
	{ suffix: "lg", width: 1080, quality: 80 },
];
const BLUR_WIDTH = 200;
const BLUR_QUALITY = 80;

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

function parseCsv(contents) {
	const rows = [];
	let row = [];
	let field = "";
	let inQuotes = false;

	for (let index = 0; index < contents.length; index += 1) {
		const char = contents[index];
		const nextChar = contents[index + 1];

		if (inQuotes) {
			if (char === '"' && nextChar === '"') {
				field += '"';
				index += 1;
				continue;
			}

			if (char === '"') {
				inQuotes = false;
				continue;
			}

			field += char;
			continue;
		}

		if (char === '"') {
			inQuotes = true;
			continue;
		}

		if (char === ",") {
			row.push(field);
			field = "";
			continue;
		}

		if (char === "\n") {
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
			continue;
		}

		if (char !== "\r") {
			field += char;
		}
	}

	if (field || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	const [headers, ...dataRows] = rows;
	if (!headers) return [];

	return dataRows
		.filter((dataRow) => dataRow.some((value) => value !== ""))
		.map((dataRow) =>
			Object.fromEntries(
				headers.map((header, index) => [header, dataRow[index] ?? ""]),
			),
		);
}

function extensionForUrl(url, contentType) {
	const extension = extname(new URL(url).pathname)
		.replace(".", "")
		.toLowerCase();

	if (extension && extension.length <= 5) {
		return extension === "jpeg" ? "jpg" : extension;
	}

	if (contentType?.includes("png")) return "png";
	if (contentType?.includes("webp")) return "webp";
	if (contentType?.includes("gif")) return "gif";
	if (contentType?.includes("avif")) return "avif";

	return "jpg";
}

function optimizedKey(originalKey, suffix) {
	const dot = originalKey.lastIndexOf(".");
	const base = dot !== -1 ? originalKey.slice(0, dot) : originalKey;
	return `${base}-${suffix}.jpg`;
}

function nullableString(value) {
	return value === "" ? null : value;
}

function nullableNumber(value) {
	if (value === "") return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function nullableRoundedNumber(value) {
	const parsed = nullableNumber(value);
	return parsed === null ? null : Math.round(parsed);
}

function nullableDate(value) {
	return value === "" ? null : value;
}

function hexToOklch(hex) {
	const rgb = parseHex(hex) ?? { r: 0, g: 0, b: 0, mode: "rgb" };
	const { a, b, l } = convertRgbToOklab(rgb);
	const c = Math.sqrt(a * a + b * b);
	const rawHue = Math.atan2(b, a) * (180 / Math.PI);
	const h = rawHue < 0 ? rawHue + 360 : rawHue;

	return {
		l: +l.toFixed(3),
		c: +c.toFixed(3),
		h: +h.toFixed(3),
	};
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

async function generateBlurData(original) {
	const data = await sharp(original)
		.rotate()
		.resize(BLUR_WIDTH)
		.modulate({ saturation: 1.15 })
		.blur(4)
		.withMetadata()
		.toFormat("jpeg", { quality: BLUR_QUALITY })
		.toBuffer();

	return `data:image/jpeg;base64,${data.toString("base64")}`;
}

async function generateColorData(original) {
	const image = sharp(original);
	const { width, height } = await image.metadata();
	const raw = await image.ensureAlpha().raw().toBuffer();
	const pixelData = {
		data: new Uint8ClampedArray(raw.buffer),
		width,
		height,
	};

	const fac = new FastAverageColor();
	const avgResult = fac.prepareResult(fac.getColorFromArray4(pixelData.data));
	const average = hexToOklch(avgResult.hex);

	const extracted = await extractColors(pixelData);
	const colors = extracted.map(({ hex }) => hexToOklch(hex));

	return { average, colors };
}

async function uploadToR2({ client, bucket, key, body, contentType }) {
	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	);
}

async function insertPhoto({
	pool,
	csvRow,
	url,
	extension,
	blurData,
	colorData,
}) {
	const aspectRatio = nullableNumber(csvRow.aspect_ratio);

	await pool.query(
		`
			insert into photos (
				id,
				url,
				extension,
				aspect_ratio,
				blur_data,
				color_data,
				title,
				caption,
				taken_at,
				taken_at_naive,
				make,
				model,
				focal_length,
				focal_length_35mm_equivalent,
				f_number,
				iso,
				exposure_time,
				exposure_compensation,
				latitude,
				longitude,
				location_name,
				created_at,
				updated_at
			) values (
				$1, $2, $3, $4, $5, $6::json, $7, $8, $9, $10, $11, $12, $13,
				$14, $15, $16, $17, $18, $19, $20, $21, $22, $23
			)
		`,
		[
			csvRow.id,
			url,
			extension,
			aspectRatio ?? 3 / 2,
			blurData,
			JSON.stringify(colorData),
			nullableString(csvRow.title),
			nullableString(csvRow.description),
			nullableDate(csvRow.take_at),
			nullableDate(csvRow.take_at),
			nullableString(csvRow.make),
			nullableString(csvRow.model),
			nullableRoundedNumber(csvRow.focal_length),
			nullableRoundedNumber(csvRow.focal_length_35mm),
			nullableNumber(csvRow.f_number),
			nullableRoundedNumber(csvRow.iso),
			nullableNumber(csvRow.exposure_time),
			nullableNumber(csvRow.exposure_compensation),
			nullableNumber(csvRow.latitude),
			nullableNumber(csvRow.longitude),
			nullableString(csvRow.location_name),
			nullableDate(csvRow.create_at) ?? new Date(),
			nullableDate(csvRow.update_at) ?? new Date(),
		],
	);
}

async function main() {
	loadEnvFile(".env");
	loadEnvFile(".env.local");

	const args = new Set(process.argv.slice(2));
	const apply = args.has("--apply");
	const csvPath =
		process.argv
			.slice(2)
			.find((arg) => arg.startsWith("--csv="))
			?.split("=")[1] ?? DEFAULT_CSV_PATH;
	const limitArg = process.argv
		.slice(2)
		.find((arg) => arg.startsWith("--limit="))
		?.split("=")[1];
	const limit = limitArg ? Number.parseInt(limitArg, 10) : undefined;

	if (limit !== undefined && (!Number.isFinite(limit) || limit < 1)) {
		throw new Error("--limit must be a positive integer");
	}

	const csvRows = parseCsv(readFileSync(csvPath, "utf8")).filter(
		(row) => row.id && row.url,
	);
	const selectedRows = limit ? csvRows.slice(0, limit) : csvRows;

	if (selectedRows.length === 0) {
		console.log("No CSV rows with id and url found.");
		return;
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
		console.log(
			`${apply ? "Migrating" : "Dry run:"} ${selectedRows.length} photo${
				selectedRows.length === 1 ? "" : "s"
			} from CSV through the normal photo R2 variant pipeline.`,
		);

		const results = [];

		for (const csvRow of selectedRows) {
			try {
				const existing = await pool.query(
					"select id, url from photos where id = $1",
					[csvRow.id],
				);

				if (existing.rows[0]?.url?.includes(config.R2_PUBLIC_URL)) {
					console.log(`[skipped] ${csvRow.id}: already on R2`);
					results.push({ status: "skipped" });
					continue;
				}

				const downloaded = await downloadImage(csvRow.url);
				const originalKey = `photos/${csvRow.id}.${downloaded.extension}`;
				const nextUrl = `${config.R2_PUBLIC_URL}/${originalKey}`;
				const [variants, blurData, colorData] = await Promise.all([
					generateVariants(downloaded.body),
					generateBlurData(downloaded.body),
					generateColorData(downloaded.body),
				]);
				const action = existing.rowCount === 0 ? "insert" : "update";

				if (!apply) {
					console.log(
						`[dry-run:${action}] ${csvRow.id} -> ${originalKey}, ${variants
							.map(({ suffix }) => optimizedKey(originalKey, suffix))
							.join(", ")}`,
					);
					results.push({ status: "dry-run" });
					continue;
				}

				await uploadToR2({
					client,
					bucket: config.R2_BUCKET,
					key: originalKey,
					body: downloaded.body,
					contentType: downloaded.contentType,
				});

				await Promise.all(
					variants.map(({ suffix, buffer }) =>
						uploadToR2({
							client,
							bucket: config.R2_BUCKET,
							key: optimizedKey(originalKey, suffix),
							body: buffer,
							contentType: "image/jpeg",
						}),
					),
				);

				if (existing.rowCount === 0) {
					await insertPhoto({
						pool,
						csvRow,
						url: nextUrl,
						extension: downloaded.extension,
						blurData,
						colorData,
					});
				} else {
					const updated = await pool.query(
						"update photos set url = $1, extension = $2, blur_data = $3, color_data = $4::json, updated_at = now() where id = $5 returning id",
						[
							nextUrl,
							downloaded.extension,
							blurData,
							JSON.stringify(colorData),
							csvRow.id,
						],
					);

					if (updated.rowCount === 0) {
						console.log(
							`[skipped] ${csvRow.id}: row disappeared before update`,
						);
						results.push({ status: "skipped" });
						continue;
					}
				}

				console.log(
					`[${existing.rowCount === 0 ? "inserted" : "migrated"}] ${
						csvRow.id
					} -> ${nextUrl}`,
				);
				results.push({ status: "migrated" });
			} catch (error) {
				console.error(
					`[failed] ${csvRow.id}: ${
						error instanceof Error ? error.message : String(error)
					}`,
				);
				results.push({ status: "failed" });
			}
		}

		const migrated = results.filter(
			(result) => result.status === "migrated",
		).length;
		const skipped = results.filter(
			(result) => result.status === "skipped",
		).length;
		const failed = results.filter(
			(result) => result.status === "failed",
		).length;

		console.log(
			`Done. migrated=${migrated} skipped=${skipped} failed=${failed} dryRun=${
				apply
					? 0
					: results.filter((result) => result.status === "dry-run").length
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

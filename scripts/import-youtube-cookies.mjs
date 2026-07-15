import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import pg from "pg";

function readEnvFile() {
	try {
		return readFileSync(".env", "utf8")
			.split(/\r?\n/)
			.reduce((env, line) => {
				const match = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
				if (!match) return env;
				const [, key, rawValue] = match;
				env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
				return env;
			}, {});
	} catch {
		return {};
	}
}

const cookiesPath = process.argv[2];
if (!cookiesPath) {
	console.error(
		"Usage: node scripts/import-youtube-cookies.mjs ./youtube_cookies.txt",
	);
	process.exit(1);
}

const cookies = readFileSync(resolve(cookiesPath), "utf8");
const cookieRows = cookies
	.split(/\r?\n/)
	.map((line) => line.trim())
	.filter((line) => line && !line.startsWith("#"));
const domains = new Set(cookieRows.map((line) => line.split(/\s+/)[0]));
const hasRelevantCookies = [...domains].some(
	(domain) =>
		domain === "youtube.com" ||
		domain.endsWith(".youtube.com") ||
		domain === "google.com" ||
		domain.endsWith(".google.com"),
);

if (cookieRows.length === 0 || !hasRelevantCookies) {
	console.error(
		[
			"The cookies file does not look like a YouTube/Google Netscape cookies export.",
			`Found ${cookieRows.length} cookie rows.`,
			`Domains: ${[...domains].slice(0, 8).join(", ") || "(none)"}`,
		].join("\n"),
	);
	process.exit(1);
}

const env = { ...readEnvFile(), ...process.env };
if (!env.DATABASE_URL) {
	console.error("DATABASE_URL is required.");
	process.exit(1);
}

const client = new pg.Client({ connectionString: env.DATABASE_URL });
await client.connect();
await client.query(
	`insert into app_config (key, value, updated_at)
	 values ('youtube_cookies', $1, now())
	 on conflict (key) do update set value = excluded.value, updated_at = now()`,
	[cookies],
);
await client.end();

console.log("Imported YouTube cookies into app_config.youtube_cookies.");

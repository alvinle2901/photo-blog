#!/usr/bin/env node
/**
 * Export YouTube/Google cookies from your browser and save to the database.
 * Run: node scripts/export-youtube-cookies.mjs [chrome|firefox|safari|edge]
 *
 * Re-run when cookies expire (usually every few weeks/months).
 */
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

for (const f of ['.env.local', '.env']) {
  const p = join(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim(), v = line.slice(eq + 1).trim();
    if (k && !process.env[k]) process.env[k] = v;
  }
}

const browser = process.argv[2] ?? 'chrome';
const tmpFile = join(tmpdir(), `yt-cookies-${Date.now()}.txt`);

console.log(`\n🍪 Exporting YouTube cookies from ${browser}...`);

try {
  // Export cookies from browser
  execSync(
    `yt-dlp --cookies-from-browser ${browser} --cookies "${tmpFile}" -g -- "dQw4w9WgXcQ" > /dev/null 2>&1 || true`,
    { stdio: 'inherit' }
  );

  if (!existsSync(tmpFile)) {
    throw new Error('Cookies file was not created. Is yt-dlp installed and are you logged in to YouTube in ' + browser + '?');
  }

  // Filter to YouTube + Google cookies only
  const allCookies = readFileSync(tmpFile, 'utf8');
  const header = '# Netscape HTTP Cookie File\n# Exported for yt-dlp.\n\n';
  const filtered = allCookies
    .split('\n')
    .filter(l => l.includes('.youtube.com') || l.includes('.google.com'))
    .join('\n');

  const cookiesContent = header + filtered;
  console.log(`   Filtered to ${filtered.split('\n').filter(Boolean).length} YouTube/Google cookies`);

  // Save to DB
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL.trim() });
  await pool.query(
    `INSERT INTO app_config (key, value, updated_at)
     VALUES ('youtube_cookies', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
    [cookiesContent]
  );
  await pool.end();
  unlinkSync(tmpFile);

  console.log('✅ Cookies saved to database (app_config.youtube_cookies)');
  console.log('   Restart the dev server to use the new cookies.\n');
} catch (e) {
  if (existsSync(tmpFile)) unlinkSync(tmpFile);
  console.error('❌', e.message);
  process.exit(1);
}

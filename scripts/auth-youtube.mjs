#!/usr/bin/env node
/**
 * One-time YouTube OAuth setup.
 * Run: node scripts/auth-youtube.mjs
 *
 * Saves credentials to the database (app_config.youtube_oauth_credentials).
 * Re-run any time you need to re-authenticate.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load env
for (const f of ['.env.local', '.env']) {
  const p = join(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim();
    if (k && !process.env[k]) process.env[k] = v;
  }
}

const { Innertube } = await import('youtubei.js');
const { Pool } = await import('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function saveCredentials(creds) {
  const json = JSON.stringify(creds);
  await pool.query(
    `INSERT INTO app_config (key, value, updated_at)
     VALUES ('youtube_oauth_credentials', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
    [json]
  );
  console.log('\n✅ Credentials saved to database (app_config.youtube_oauth_credentials)');
}

const yt = await Innertube.create();

console.log('\n🔑 Starting YouTube OAuth device code flow...\n');

yt.session.on('auth-pending', async (data) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  1. Open this URL:  ${data.verification_url}`);
  console.log(`  2. Enter code:     ${data.user_code}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nWaiting for you to authenticate...');
});

yt.session.on('auth', async ({ credentials }) => {
  console.log('\n🎉 Authenticated successfully!');
  await saveCredentials(credentials);
  await pool.end();
  process.exit(0);
});

yt.session.on('update-credentials', async ({ credentials }) => {
  await saveCredentials(credentials);
});

try {
  await yt.session.signIn();
} catch (e) {
  console.error('Auth failed:', e.message);
  await pool.end();
  process.exit(1);
}

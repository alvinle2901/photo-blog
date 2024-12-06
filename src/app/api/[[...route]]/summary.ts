import { sql } from 'drizzle-orm';
import { Context, Hono } from 'hono';

import { type AuthConfig, initAuthConfig, verifyAuth } from '@hono/auth-js';

import authConfig from '@/auth.config';
import { db } from '@/db/drizzle';
import { photos } from '@/db/schema';

const app = new Hono().use('*', initAuthConfig(getAuthConfig)).get('/', verifyAuth(), async (c) => {
  const auth = c.get('authUser');

  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const yearRes = await db
    .select({
      year: sql`EXTRACT(YEAR FROM TO_TIMESTAMP(${photos.takeAt}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))`.as<string>(),
      count: sql`CAST(COUNT(*) AS INTEGER)`.as<number>(),
    })
    .from(photos)
    .groupBy(sql`EXTRACT(YEAR FROM TO_TIMESTAMP(${photos.takeAt}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))`)
    .orderBy(
      sql`EXTRACT(YEAR FROM TO_TIMESTAMP(${photos.takeAt}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) ASC`,
    )
    .execute();

  const extractCity = () =>
    sql<string>`
      TRIM(SPLIT_PART(${photos.locationName}, ',', 1))
    `.as('city');

  const cityRes = await db
    .select({
      city: extractCity(),
      count: sql`CAST(COUNT(*) AS INTEGER)`.as<number>(),
    })
    .from(photos)
    .groupBy(extractCity())
    .orderBy(extractCity())
    .execute();

  const extractCountry = () =>
    sql<string>`
      TRIM(SPLIT_PART(${photos.locationName}, ',', array_length(string_to_array(${photos.locationName}, ','), 1)))
    `.as('country');

  const countryRes = await db
    .select({
      country: extractCountry(),
    })
    .from(photos)
    .groupBy(extractCountry())
    .execute();

  const countryArray = countryRes.map((row) => row.country);

  return c.json({
    data: {
      yearRes,
      cityRes,
      countryArray,
    },
  });
});

function getAuthConfig(c: Context): AuthConfig {
  return { ...authConfig };
}

export default app;
